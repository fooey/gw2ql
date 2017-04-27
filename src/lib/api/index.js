import path from 'path';
import qs from 'querystring';

import _ from 'lodash';
import Fetch from 'make-fetch-happen';
import storage from 'node-persist';

export const CACHE_LONG = 1000 * 60 * 60;
export const CACHE_SHORT = 1000 * 5;


export { getLang, getLangs } from './lang';
export { getGuild, getGuilds } from './guild';
export { getObjective, getObjectives } from './objective';
export { getWorld, getWorlds } from './world';
export { getMatch, getMatches } from './match';


export const BASE_URL = `https://api.guildwars2.com`;

// export { getMember } from './member';


// const instance = axios.create({
//   baseURL: BASE_URL,
//   timeout: 1000 * 10
// });

const instance = Fetch.defaults({
  cacheManager: path.join(process.cwd(), 'cache', 'fetch'), // path where cache will be written (and read)
})

export function init() {
	return storage.init({
        dir: path.join(process.cwd(), 'cache', 'persist'),
        ttl: 1000 * 60 * 60 * 4,
        expiredInterval: 1000 * 60 * 60 * 1,
	});
}


export function fetch(relativeURL, params = {}, storageOptions = {}) {
	const queryString = !_.isEmpty(params) ? '?' + qs.stringify(params) : '';
    const fetchUrl = `${BASE_URL}${relativeURL}${queryString}`;

	const retryOptions = {
		retry: {
			retries: 10,
			randomize: true,
		},
	};

	// console.log('fetchUrl', fetchUrl, params);

	return storage.getItem(fetchUrl).then(result => {
		if (!_.isEmpty(result)) {
			// console.log('cache hit', fetchUrl);
			return result;
		} else {
			// console.log('cache miss', fetchUrl);
            return instance(fetchUrl, retryOptions)
				.then(res => {
					console.log('fetched', res.url);

					return res.json();
				}).then(result => {
					return storage.setItem(fetchUrl, result, storageOptions).then(() => result);
				});
		}
	});

    // return instance.get(fetchUrl, { params })
	// 	.then(response => {
	// 		console.log('requestURL', _.get(response, 'request._currentRequest.path', 'PATH NOT FOUND'));
	// 		// console.log('data', response.data);
	//
	// 		return _.get(response, 'data');
	// 	})
	// 	.catch(err => {
	// 		console.error(err);
	// 		return [];
	// 	});
}

//
// export function fetchMatches(slug = '') {
//     return fetch(`/v2/wvw/matches${slug}`);
// }
//
// export function getMatch(id) {
//     return fetchMatches(`/${id}`);
// }
//
// export function getMatches(ids=['all']) {
//     return fetchMatches(`?ids=${ids}`);
// }
