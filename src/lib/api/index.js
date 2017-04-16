
import axios from 'axios';
import DataLoader from 'dataloader';
import _ from 'lodash';

export const CACHE_LONG = 1000 * 60 * 60;
export const CACHE_SHORT = 1000 * 5;

export const langs = {
	"en": {
		"slug": "en",
		"label": "EN",
		"link": "/en",
		"name": "English"
	},
	"de": {
		"slug": "de",
		"label": "DE",
		"link": "/de",
		"name": "Deutsch"
	},
	"es": {
		"slug": "es",
		"label": "ES",
		"link": "/es",
		"name": "Español"
	},
	"fr": {
		"slug": "fr",
		"label": "FR",
		"link": "/fr",
		"name": "Français"
	},
	"zh": {
		"slug": "zh",
		"label": "ZH",
		"link": "/zh",
		"name": "Chinese"
	},
};


export { getObjectives } from './objective';
export { fetchWorlds, getWorld, getWorlds } from './world';


export const BASE_URL = `https://api.guildwars2.com`;

// export { getMember } from './member';


const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 1000 * 10
});


export function fetch(relativeURL, params = {}) {
    const fetchUrl = `https://api.guildwars2.com${relativeURL}`;

	console.log('fetchUrl', fetchUrl, params);

    return instance.get(fetchUrl, { params })
		.then(response => {
			console.log('requestURL', _.get(response, 'request._currentRequest.path', 'PATH NOT FOUND'));
			// console.log('data', response.data);

			return _.get(response, 'data');
		})
		.catch(err => {
			console.error(err);
			return [];
		});
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
