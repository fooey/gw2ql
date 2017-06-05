
import Promise from 'bluebird';
import _ from 'lodash';
import moment from 'moment';


import { fetch } from 'src/lib/api';


const ENDPOINT_MATCHES = `/v2/wvw/matches`;
const STORAGE_OPTIONS = { ttl: 1000 * 1 };

const UPDATE_MIN = 1000 * 8;
const UPDATE_MAX = UPDATE_MIN * 2;



const INSTANCE = { cache: {} };


export function init() {
	return updateCache();
}

async function updateCache() {
	try {
		await buildCache();
	}
	catch(e){ console.log(e); }

	setTimeout(updateCache, getUpdateTimeout());
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
	_.set(match, 'maps', _.get(match, 'maps', []).map(m => {
		return getMatchMap(m);
	}));

	const lastFlippedMap = _.maxBy(match.maps, 'last_flipped');
	const lastClaimedMap = _.maxBy(match.maps, 'last_flipped');

	const lastFlipped = _.get(lastFlippedMap, 'last_flipped', null);
	const claimedAt = _.get(lastClaimedMap, 'last_flipped', null);
	const lastMod = _.max([lastFlipped, claimedAt]);

	_.merge(match, {
		last_flipped: lastFlipped,
		claimed_at: claimedAt,
		last_modified: lastMod,
	});

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

function getMatchMap(matchMap) {
	matchMap.objectives = _.map(matchMap.objectives, o => getObjective(o));

	const lastFlippedObjective = _.maxBy(matchMap.objectives, 'last_flipped');
	const lastClaimedObjective = _.maxBy(matchMap.objectives, 'claimed_at');

	const lastFlipped = _.get(lastFlippedObjective, 'last_flipped', null);
	const claimedAt = _.get(lastClaimedObjective, 'claimed_at', null);
	const lastMod = _.max([lastFlipped, claimedAt]);

	_.merge(matchMap, {
		last_flipped: lastFlipped,
		claimed_at: claimedAt,
		last_modified: lastMod,
	});

	return matchMap;
}

function getObjective(objective) {
	const lastFlipped = objective.last_flipped ? moment(objective.last_flipped, moment.ISO_8601).unix() : null;
	const claimedAt = objective.claimed_at ? moment(objective.claimed_at, moment.ISO_8601).unix() : null;
	const lastMod = _.max([lastFlipped, claimedAt]);

	_.merge(objective, {
		last_flipped: lastFlipped,
		claimed_at: claimedAt,
		last_modified: lastMod,
	});

	return objective;
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
