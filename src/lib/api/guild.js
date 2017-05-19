
import Promise from 'bluebird';

import { fetch } from 'src/lib/api';

const ENDPOINT_GUILD = `/v2/guild`;
const STORAGE_OPTIONS = { ttl: 1000 * 60 * 60 * 4 };


export function init() {
	return Promise.resolve();
}


export function fetchGuild(id) {
	// console.log('fetchGuilds', query);
	return fetch(`${ENDPOINT_GUILD}/${id}`, {}, STORAGE_OPTIONS);
}

export function getGuild(id) {
	// console.log('getGuild', id);

	return fetchGuild(id);
}

export function getGuilds(ids) {
	// console.log('getGuild', id);
	return Promise.map(ids, id => getGuild(id));
}
