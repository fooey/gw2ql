
import Promise from 'bluebird';
import _ from 'lodash';


import { fetch } from 'src/lib/api';
import langs from 'src/lib/api/langs';


let cache = {};


const ENDPOINT_WORLDS = `/v2/worlds`;

function slugify(str) {
	return _.words(_.deburr(str).toLowerCase()).join('-');
}



export function init() {
	return fetchWorlds().then(ids => {
		const idList = ids.toString();

		const promisedLangs = _.reduce(langs, (acc, lang, langSlug) => {
			return Object.assign(acc, {
				[langSlug]: fetchWorlds({ ids: idList, lang: langSlug }).then(result => _.keyBy(result, 'id'))
			});
		}, {});

		return Promise.props(promisedLangs).then(worlds => {
			cache = {};

			ids.forEach(id => {
				const worldBase = {
					id,
					population: _.get(worlds, ['en', 'population'])
				};

				const world = _.reduce(langs, (acc, lang, langSlug) => {
					const name = _.get(worlds, [langSlug, id, 'name']);
					const slug = slugify(name);

					return _.set(acc, langSlug, { name, slug });

				}, worldBase);

				_.set(cache, [id], world);
			});

			return cache;
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
