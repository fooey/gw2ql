
import Promise from 'bluebird';
import _ from 'lodash';


import { fetch } from 'src/lib/api';
import { getLangs } from 'src/lib/api/lang';

import { slugify } from 'src/lib/util';


const ENDPOINT_WORLDS = `/v2/worlds`;
const STORAGE_OPTIONS = { ttl: 1000 * 60 * 60 * 4 };

const UPDATE_MIN = 1000 * 60 * 60;
const UPDATE_MAX = UPDATE_MIN * 4;
const UPDATE_MIN_COLD = 1000 * 8;
const UPDATE_MAX_COLD = UPDATE_MIN_COLD * 4;



const INSTANCE = { cache: {} };


export function init() {
	return updateCache();
}

function updateCache() {
	return buildCache()
		.finally(() => setTimeout(updateCache, getUpdateTimeout()));
}

function getUpdateTimeout() {
	return _.isEmpty(INSTANCE.cache) ? _.random(UPDATE_MIN_COLD, UPDATE_MAX_COLD) : _.random(UPDATE_MIN, UPDATE_MAX);
}

function buildCache() {
	console.log('world', 'buildCache');

	return Promise.props({
		ids: fetchWorlds(),
		langs: getLangs(),
	}).then(props => {
		const { ids, langs } = props;
		const idList = props.ids.toString();

		const promiseProps = _.chain(langs)
			.map('slug')
			.keyBy()
			.mapValues(lang => fetchWorlds({ lang, ids: idList }).then(result => _.keyBy(result, 'id')))
			.valueOf();

		return Promise.props(promiseProps).then(worlds => {
			const newCache = _.chain(ids)
				.map(id => buildWorld(id, worlds, langs))
				.keyBy('id')
				.valueOf();

			INSTANCE.cache =  _.merge({}, newCache);

			return INSTANCE.cache;
		});
	});
}

function buildWorld(id, worlds, langs) {
	id = id.toString();

	const worldBase = {
		id,
		population: _.get(worlds, ['en', id, 'population']),
		region: getRegion(id),
		lang: getLang(id),
		slugs: [],
	};

	return _.reduce(langs, (acc, lang) => {
		const name = _.get(worlds, [lang.slug, id, 'name']);
		const slug = slugify(name);

		acc.slugs.push(slug);

		return _.set(acc, lang.slug, { name, slug });

	}, worldBase);
}

function getRegion(worldId) {
	switch (worldId[0]) {
		case '1': return 'na';
		case '2': return 'eu';
		default: return 'err';
	}
}

function getLang(worldId) {
	switch (worldId[1]) {
		case '0': return 'en';
		case '1': return 'fr';
		case '2': return 'de';
		case '3': return 'es';
		default: return 'err';
	}
}


export function fetchWorlds(query) {
	// console.log('fetchWorlds', query);
	return fetch(ENDPOINT_WORLDS, query, STORAGE_OPTIONS);
}

export function getWorld(id) {
	// console.log('getWorld', id);
	return Promise.resolve(_.get(INSTANCE.cache, id));
}
export function getWorldBySlug(slug) {
	// console.log('getWorldBySlug', slug);
	return Promise.resolve(_.find(INSTANCE.cache, world => {
		return _.includes(world.slugs, slug);
	}));
}

export function getWorlds(ids=['all']) {
	// console.log('getWorlds', ids.toString());

	if (!Array.isArray(ids) || ids.length === 0 || ids.indexOf('all') !== -1) {
		return Promise.resolve(_.values(INSTANCE.cache));
	} else {
		return Promise.resolve(_.values(_.pick(INSTANCE.cache, ids)));
	}
}
