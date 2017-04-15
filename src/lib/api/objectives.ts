import DataLoader from 'dataloader';
import LRU from 'lru-cache';

import { fetch, CACHE_LONG } from './';

const ENDPOINT_OBJECTIVES = `/v2/wvw/objectives`;


export function fetchObjectives(slug) {
    return fetch(`${ENDPOINT_OBJECTIVES}${slug ? slug : ''}`);
}

export function getObjective(id) {
    return getObjectives([...id]);
}

export function getObjectives(ids) {
	ids = Array.isArray(ids) ? ids : [].concat(ids);

	if (ids.indexOf('all') !== -1) {
		return fetchObjectives().then(ids => objectivesLoader.loadMany(ids));
	} else {
		return objectivesLoader.loadMany(ids);
	}
}

export const objectivesLoader = new DataLoader(
    ids => fetchObjectives(`?ids=${ids}`),
    { cacheMap: LRU({ maxAge: CACHE_LONG })}
);
