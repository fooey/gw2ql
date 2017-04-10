
import axios from 'axios';
import DataLoader from 'dataloader';
import LRU from 'lru-cache';

const CACHE_LONG = 1000 * 60 * 60;
const CACHE_SHORT = 1000 * 5;


export function fetch(relativeURL) {
    const fetchUrl = `https://api.guildwars2.com${relativeURL}`;

	console.log('fetchUrl', fetchUrl);

    return axios.get(fetchUrl).then(response => response.data)
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



export function fetchObjectives(slug = '') {
    return fetch(`/v2/wvw/objectives${slug}`);
}

export function getObjective(id) {
    return getObjectives([...id]);
}

export function getObjectives(ids=['all']) {
    return fetchObjectives(`?ids=${ids}`);
}

export const objectivesLoader = new DataLoader(
    ids => getObjectives(ids),
    { cacheMap: LRU({ maxAge: CACHE_LONG })}
);

export default {
	fetch,

	fetchWorlds,
	getWorld,
	getWorlds,

	fetchMatches,
	getMatch,
	getMatches,

	fetchObjectives,
	getObjective,
	getObjectives,
	objectivesLoader,
};
