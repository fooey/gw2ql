
import Promise from 'bluebird';
import _ from 'lodash';


import { fetch } from 'src/lib/api';


const ENDPOINT_MATCHES = `/v2/wvw/matches`;
const STORAGE_OPTIONS = { ttl: 1000 * 60 * 60 * 4 };

const UPDATE_MIN = 1000 * 2;
const UPDATE_MAX = UPDATE_MIN * 2;



const INSTANCE = { cache: {} };


export function init() {
	return updateCache();
}

function updateCache() {
	return buildCache()
		.finally(() => setTimeout(updateCache, getUpdateTimeout()));
}

function getUpdateTimeout() {
	return _.random(UPDATE_MIN, UPDATE_MAX);
}

function buildCache() {
	// console.log('match', 'buildCache');

	return fetchMatches({ids: 'all'}).then(matches => {
		INSTANCE.cache =  _.keyBy(matches, 'id');

		return INSTANCE.cache;
	});
}


export function fetchMatches(query) {
	// console.log('fetchMatches', query);
    return fetch(ENDPOINT_MATCHES, query, STORAGE_OPTIONS);
}

export function getMatch(id) {
	// console.log('getMatch', id);
    return Promise.resolve(_.get(INSTANCE.cache, id));
}

export function getMatches(ids=['all']) {
	// console.log('getMatches', ids.toString());

	if (!Array.isArray(ids) || ids.length === 0 || ids.indexOf('all') !== -1) {
		return Promise.resolve(_.values(INSTANCE.cache));
	} else {
		return Promise.resolve(_.values(_.pick(INSTANCE.cache, ids)));
	}
}
