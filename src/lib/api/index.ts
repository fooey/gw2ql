
import axios from 'axios';
import DataLoader from 'dataloader';
import LRU from 'lru-cache';

export const CACHE_LONG = 1000 * 60 * 60;
export const CACHE_SHORT = 1000 * 5;


export { getObjectives } from './objectives';


export function fetch(relativeURL) {
    const fetchUrl = `https://api.guildwars2.com${relativeURL}`;

	console.log('fetchUrl', fetchUrl);

    return axios.get(fetchUrl)
		.then(response => response.data)
		.catch(err => {
			console.error(err);
			return [];
		});
}


export function fetchWorlds(slug = '') {
	// console.log('fetchWorlds', slug);
    return fetch(`/v2/worlds${slug}`);
}

export function getWorld(id) {
	// console.log('getWorld', id);
    return getWorlds([...id]);
}

export function getWorlds(ids=['all']) {
	// console.log('getWorlds', ids);
    return fetchWorlds(`?ids=${ids.join(',')}`);
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
