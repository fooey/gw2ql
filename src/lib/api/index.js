import path from 'path';
import qs from 'querystring';

import _ from 'lodash';
import Fetch from 'make-fetch-happen';
import storage from 'node-persist';

export const CACHE_LONG = 1000 * 60 * 60;
export const CACHE_SHORT = 1000 * 5;

import langs from 'src/lib/api/langs';


export { getObjectives } from './objective';
export { fetchWorlds, getWorld, getWorlds } from './world';


export const BASE_URL = `https://api.guildwars2.com`;

// export { getMember } from './member';


// const instance = axios.create({
//   baseURL: BASE_URL,
//   timeout: 1000 * 10
// });

const instance = Fetch.defaults({
  cacheManager: path.join(process.cwd(), 'cache', 'fetch') // path where cache will be written (and read)
})

export function init() {
	return storage.init({
		dir: path.join(process.cwd(), 'cache', 'persist'),
		// stringify: JSON.stringify,
		// parse: JSON.parse,
		// encoding: 'utf8',
		// logging: false,  // can also be custom logging function
		// continuous: true, // continously persist to disk
		// interval: false, // milliseconds, persist to disk on an interval
		// ttl: false, // ttl* [NEW], can be true for 24h default or a number in MILLISECONDS
		ttl: 1000 * 60 * 60 * 1, // ttl* [NEW], can be true for 24h default or a number in MILLISECONDS
		// expiredInterval: 2 * 60 * 1000, // [NEW] every 2 minutes the process will clean-up the expired cache
	    // in some cases, you (or some other service) might add non-valid storage files to your
	    // storage dir, i.e. Google Drive, make this true if you'd like to ignore these files and not throw an error
	    // forgiveParseErrors: false // [NEW]
	});
}


export function fetch(relativeURL, params = {}) {
	const queryString = !_.isEmpty(params) ? '?' + qs.stringify(params) : '';
    const fetchUrl = `${BASE_URL}${relativeURL}${queryString}`;

	const retryOptions = {
		retry: {
			retries: 10,
			randomize: true
		}
	};

	console.log('fetchUrl', fetchUrl, params);

	return storage.getItem(fetchUrl).then(result => {
		if (result) {
			console.log('cache hit', fetchUrl);
			return result;
		} else {
			console.log('cache miss', fetchUrl);
		    return instance(fetchUrl, retryOptions)
				.then(res => {
					console.log(res.url);

					return res.json();
				}).then(result => {
					return storage.setItem(fetchUrl, result).then(() => result);
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


export function fetchMatches(slug = '') {
    return fetch(`/v2/wvw/matches${slug}`);
}

export function getMatch(id) {
    return fetchMatches(`/${id}`);
}

export function getMatches(ids=['all']) {
    return fetchMatches(`?ids=${ids}`);
}
