
import path from 'path';

import Promise from 'bluebird';
import _ from 'lodash';


import { fetch } from 'src/lib/api';
import { langs } from 'src/lib/api/lang';


let cache = {};

const ENDPOINT_WORLDS = `/v2/worlds`;

function slugify(str) {
	return _.words(_.deburr(str).toLowerCase()).join('-');
}



export function init() {
	return fetchWorlds().then(ids => {
		const idList = ids.toString();

		const promisedLangs = _.reduce(langs, (acc, lang) => {
			return _.merge(acc, {
				[lang.slug]: fetchWorlds({ ids: idList, lang: lang.slug }).then(result => _.keyBy(result, 'id'))
			});
		}, {});

		return Promise.props(promisedLangs).then(worlds => {
			cache = {};

			ids.forEach(id => {
				const worldBase = {
					id,
					population: _.get(worlds, ['en', id, 'population']),
					slugs: [],
				};

				const world = _.reduce(langs, (acc, lang) => {
					const name = _.get(worlds, [lang.slug, id, 'name']);
					const slug = slugify(name);

					acc.slugs.push(slug);

					return _.set(acc, lang.slug, { name, slug });

				}, worldBase);

				_.set(cache, [id], world);
			});

			return _.sortBy(cache, 'id');
		});
	});

};


export function fetchWorlds(query) {
	// console.log('fetchWorlds', query);
    return fetch(ENDPOINT_WORLDS, query);
}

export function getWorld(id) {
	// console.log('getWorld', id);
    return Promise.resolve(_.get(cache, id));
}

export function getWorlds(ids=['all']) {
	// console.log('getWorlds', ids.toString());

	if (!Array.isArray(ids) || ids.length === 0 || ids.indexOf('all') !== -1) {
		return getWorlds(_.keys(cache));
	} else {
		return Promise.map(ids, id => _.get(cache, id));
		// return Promise.resolve(_.values(_.pick(cache, ids)));
	}
}
