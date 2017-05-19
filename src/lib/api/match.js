
import Promise from 'bluebird';
import _ from 'lodash';


import { fetch } from 'src/lib/api';


const ENDPOINT_MATCHES = `/v2/wvw/matches`;
const STORAGE_OPTIONS = { ttl: 1000 * 1 };

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
		INSTANCE.cache =  _.chain(matches)
			.map(match => buildMatch(match))
			.keyBy('id')
			.value();

		return INSTANCE.cache;
	});
}

function buildMatch(match) {
	_.set(match, 'region', getRegion(match.id));
	_.set(match, 'world_ids', getWorldIds(match.all_worlds));

	return match;
}

function getRegion(matchId) {
	return (matchId.charAt(0) === '1') ? 'NA' : 'EU';
}

function getWorldIds(allWorlds) {
	return _.chain(allWorlds)
		.values()
		.flatten()
		.map(id => id.toString())
		.value();
}


export function fetchMatches(query) {
	// console.log('fetchMatches', query);
	return fetch(ENDPOINT_MATCHES, query, STORAGE_OPTIONS);
}

export function getMatch(id) {
	id = id.toString();
	// console.log('getMatch', id);
	return Promise.resolve(_.get(INSTANCE.cache, id));
}

export function getWorldMatch(worldId) {
	worldId = worldId.toString();
	return Promise.resolve(_.find(INSTANCE.cache, match => {
		return _.includes(match.world_ids, worldId);
	}));
}

export function getMatches(ids=['all']) {
	// console.log('getMatches', ids.toString());

	if (!Array.isArray(ids) || ids.length === 0 || ids.indexOf('all') !== -1) {
		return Promise.resolve(_.values(INSTANCE.cache));
	} else {
		return Promise.resolve(_.values(_.pick(INSTANCE.cache, ids)));
	}
}
