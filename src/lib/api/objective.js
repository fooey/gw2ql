
import Promise from 'bluebird';
import _ from 'lodash';


import { fetch } from 'src/lib/api';
import langs from 'src/lib/api/langs';

let cache = {};


const ENDPOINT_OBJECTIVES = `/v2/wvw/objectives`;

function slugify(str) {
	return _.words(_.deburr(str).toLowerCase()).join('-');
}



export function init() {
	return fetchObjectives().then(ids => {
		const idList = ids.toString();

		const promisedLangs = _.reduce(langs, (acc, lang, langSlug) => {
			return Object.assign(acc, {
				[langSlug]: fetchObjectives({ ids: idList, lang: langSlug }).then(result => _.keyBy(result,  'id'))
			});
		}, {});

		return Promise.props(promisedLangs).then(objectives => {
			cache = {};

			ids.forEach(id => {
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

				const objective = _.reduce(langs, (acc, lang, langSlug) => {
					const name = _.get(objectives, [langSlug, id, 'name']);
					const slug = slugify(name);

					return _.set(acc, langSlug, { name, slug });

				}, objectiveBase);

				_.set(cache, id, objective);
			});

			return cache;
		});
	});

};


export function fetchObjectives(query) {
	// console.log('fetchObjectives', query);
    return fetch(ENDPOINT_OBJECTIVES, query);
}

export function getObjective(id) {
	// console.log('getObjective', id);
    return Promise.resolve(_.get(cache, id));
}

export function getObjectives(ids=['all']) {
	// console.log('getObjectives', ids.toString());

	if (!Array.isArray(ids) || ids.length === 0 || ids.indexOf('all') !== -1) {
		return getObjectives(_.keys(cache));
	} else {
		return Promise.map(ids, id => _.get(cache, id));
	}
}
