import path from 'path';
import qs from 'querystring';

import _ from 'lodash';
// import Fetch from 'make-fetch-happen';
import axios from 'axios';
import storage from 'node-persist';
import promiseRetry from 'promise-retry';

export const CACHE_LONG = 1000 * 60 * 60;
export const CACHE_SHORT = 1000 * 5;


export { getLang, getLangs } from './lang';
export { getGuild, getGuilds } from './guild';
export { getObjective, getObjectives } from './objective';
export { getWorld, getWorlds, getWorldBySlug } from './world';
export { getMatch, getMatches, getWorldMatch } from './match';
export { getTeamStats, getMatchStatsByType, getTeamStatsByColor, getTeamStat } from './teamStat';


export const BASE_URL = `https://api.guildwars2.com`;
export const COLORS = ['red', 'blue', 'green'];
export const CACHE_PATH = path.join(process.cwd(), 'cache', 'persist');

const fetchInstance = axios.create({
	baseURL: BASE_URL,
	timeout: 5 * 1000,
	// headers: {'X-Custom-Header': 'foobar'}
});

const RETRY_OPTIONS = {
	// retries: 10,
	retries: 3,
	// factor: 2,
	// minTimeout: 1 * 1000,
	// maxTimeout: Infinity,
	randomize: true,
};

async function fetchRetry(fetchUrl) {
	return promiseRetry(async (retry, number) => {
		if (number !== 1) {
			console.log('attempt number', number, fetchUrl);
		}

		try {
			const res = await fetchInstance(fetchUrl);
			const { status, statusText, data } = res;

			if (status.toString().charAt(0) !== '2') {
				throw(statusText);
			}

			return data;
		}
		catch(err) {
			console.error(Date.now(), 'fetch', 'error', err);
			retry();
		}
	}, RETRY_OPTIONS);
}


export function init() {
	return storage.init({
		dir: CACHE_PATH,
		ttl: 1000 * 60 * 60 * 4,
		expiredInterval: 1000 * 60 * 60 * 1,
	});
}


export async function fetch(relativeURL, params = {}, storageOptions = {}) {
	try {
		const queryString = !_.isEmpty(params) ? '?' + qs.stringify(params) : '';
		const fetchUrl = `${relativeURL}${queryString}`;

		// console.log('fetchUrl', fetchUrl, params);

		const cachedResult = await storage.getItem(fetchUrl);

		if (!_.isEmpty(cachedResult)) {
			// console.log('cache hit', fetchUrl);
			return cachedResult;
		} else {
			// console.log('cache miss', fetchUrl);
			const data = await fetchRetry(fetchUrl);

			await storage.setItem(fetchUrl, data, storageOptions);

			// console.log('data', data);

			return data;
		}
	}
	catch(e) {
		throw e;
	}
}
