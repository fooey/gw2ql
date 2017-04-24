
import Promise from 'bluebird';
import _ from 'lodash';


import { slugify } from 'src/lib/util';
import { fetch } from 'src/lib/api';
import { langs } from 'src/lib/api/lang';


let cache = {};

const ENDPOINT_WORLDS = `/v2/worlds`;
const UPDATE_MIN = 1000 * 60 * 60;
const UPDATE_MAX = UPDATE_MIN * 4;

const UPDATE_MIN_COLD = 1000 * 8;
const UPDATE_MAX_COLD = UPDATE_MIN_COLD * 4;


export function init() {
	return updateCache();
}

function updateCache() {
	return buildCache()
		.finally(() => {
			setTimeout(updateCache, getUpdateTimeout());
		});
}

function getUpdateTimeout() {
	let updateTimeout = _.random(UPDATE_MIN, UPDATE_MAX);

	if (_.isEmpty(cache)) {
		console.log('COLD CACHE');
		updateTimeout = _.random(UPDATE_MIN_COLD, UPDATE_MAX_COLD);
	}

	console.log('world', 'updateTimeout', updateTimeout);

	return updateTimeout;
}

function buildCache() {
	console.log('buildCache');
	return fetchWorlds().then(ids => {
		const idList = ids.toString();

		const promisedLangs = _.reduce(langs, (acc, lang) => {
			return _.merge(acc, {
				[lang.slug]: fetchWorlds({ ids: idList, lang: lang.slug }).then(result => _.keyBy(result, 'id')),
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
}


export function fetchWorlds(query) {
	// console.log('fetchWorlds', query);
    return fetch(ENDPOINT_WORLDS, query, { ttl: 1000 * 60 * 60 * 4 });
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
