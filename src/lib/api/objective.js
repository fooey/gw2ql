
import Promise from 'bluebird';
import _ from 'lodash';


import { fetch } from 'src/lib/api';
import { getLangs } from 'src/lib/api/lang';

import { slugify } from 'src/lib/util';


const ENDPOINT_OBJECTIVES = `/v2/wvw/objectives`;
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
	console.log('objective', 'buildCache');

	return Promise.props({
		ids: fetchObjectives(),
		langs: getLangs(),
	}).then(props => {
		const { ids, langs } = props;
		const idList = props.ids.toString();

		const promiseProps = _.chain(langs)
			.map('slug')
			.keyBy()
			.mapValues(lang => fetchObjectives({ lang, ids: idList }).then(result => _.keyBy(result, 'id')))
			.valueOf();

		return Promise.props(promiseProps).then(worlds => {
			const newCache = _.chain(ids)
				.map(id => buildObjective(id, worlds, langs))
				.keyBy('id')
				.valueOf();

			INSTANCE.cache =  _.merge({}, newCache);

			return INSTANCE.cache;
		});
	});
}

function buildObjective(id, objectives, langs) {
	const objectiveBase = {
		id,
		sector_id: _.get(objectives, ['en', id, 'sector_id']),
		type: _.get(objectives, ['en', id, 'type']),
		map_type: _.get(objectives, ['en', id, 'map_type']),
		map_id: _.get(objectives, ['en', id, 'map_id']),
		coord: _.get(objectives, ['en', id, 'coord']),
		label_coord: _.get(objectives, ['en', id, 'label_coord']),
		marker: _.get(objectives, ['en', id, 'marker']),
		chat_link: _.get(objectives, ['en', id, 'chat_link']),
	};

	return _.reduce(langs, (acc, lang) => {
		const name = _.get(objectives, [lang.slug, id, 'name']);
		const slug = slugify(name);

		return _.set(acc, lang.slug, { name, slug });

	}, objectiveBase);
}


export function fetchObjectives(query) {
	// console.log('fetchObjectives', query);
	return fetch(ENDPOINT_OBJECTIVES, query, STORAGE_OPTIONS);
}

export function getObjective(id) {
	// console.log('getObjective', id);
	return Promise.resolve(_.get(INSTANCE.cache, id));
}

export function getObjectives(ids=['all']) {
	// console.log('getObjectives', ids.toString());

	if (!Array.isArray(ids) || ids.length === 0 || ids.indexOf('all') !== -1) {
		return Promise.resolve(_.values(INSTANCE.cache));
	} else {
		return Promise.resolve(_.values(_.pick(INSTANCE.cache, ids)));
	}
}
