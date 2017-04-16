
import LRU from 'lru-cache';

import {
	fetch,
	CACHE_LONG
} from 'src/lib/api';


export const ENDPOINT_OBJECTIVES = `/v2/wvw/objectives`;

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
