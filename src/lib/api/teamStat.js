
import Promise from 'bluebird';
import _ from 'lodash';

import { fetch } from 'src/lib/api';

const ENDPOINT = `/v2/wvw/matches/stats`;
const STORAGE_OPTIONS = { ttl: 1000 * 60 };

export const RANKING_TYPES = ['top'];
export const STAT_TYPES = ['kills', 'kdr'];


export async function init() {
	return Promise.resolve();
}


export async function fetchTeamStat(matchId, teamColor, statType, rankingType='top') {
	// console.log('fetchTeamStat');

	const url = _.without([
		ENDPOINT,
		matchId,
		'teams',
		teamColor,
		rankingType,
		statType,
	], undefined).join('/');

	return fetch(url, {}, STORAGE_OPTIONS);
}

export async function getTeamStat(matchId, teamColor, statType) {
	// console.log('getTeamStat', matchId, teamColor, statType);

	return fetchTeamStat(matchId, teamColor, statType);
}

export async function getMatchStatTypes() {
	// console.log('getMatchStatTypes');

	return getTeamStat('1-1', 'red');
}

/*
const schema = [{
	type: 'kills',
	red: [],
	blue: [],
	green: [],
}, {
	type: 'kdr',
	red: [],
	blue: [],
	green: [],
}];
*/

export async function getTeamStats(matchId) {
	return getTypes(matchId);
}

async function getTypes(matchId) {
	const statTypes = await getMatchStatTypes();

	return Promise.map(statTypes, type => getColors(matchId, type));
}

async function getColors(matchId, type) {
	const teams = await Promise.props({
		red: getTeamStat(matchId, 'red', type),
		blue: getTeamStat(matchId, 'blue', type),
		green: getTeamStat(matchId, 'green', type),
	});

	return _.merge({ type }, teams);
}
