
import _ from 'lodash';

import {
	GraphQLObjectType,
	GraphQLString,
	GraphQLFloat,
	GraphQLList,
	GraphQLID,
	GraphQLNonNull,
} from 'graphql/type';

import langs from 'src/lib/api/lang';

import {
	getObjective,
	getObjectives,
} from 'src/lib/api';



export const Objective = new GraphQLObjectType({
	name: 'Objective',
	fields: () => _.reduce(langs, (acc, lang, langSlug) => {
		return _.set(acc, langSlug, { type: ObjectiveLang });
	}, {
		id: { type: GraphQLID },
		sector_id: { type: GraphQLID },
		type: { type: GraphQLString },
		map_type: { type: GraphQLString },
		map_id: { type: GraphQLID },
		coord: { type: new GraphQLList(GraphQLFloat) },
		label_coord: { type: new GraphQLList(GraphQLFloat) },
		marker: { type: GraphQLString },
		chat_link: { type: GraphQLString },
	}),
});

export const ObjectiveLang = new GraphQLObjectType({
	name: 'ObjectiveLang',
	fields: () => ({
		name: { type: GraphQLString },
		slug: { type: GraphQLString },
	}),
});

export const ObjectiveQuery = {
	type: Objective,
	args: {
		id: { type: new GraphQLNonNull(GraphQLID) },
	},
	resolve: (parent, { id }) => getObjective(id),
};

export const ObjectivesQuery = {
	type: new GraphQLList(Objective),
	args: {
		ids: { type: new GraphQLList(GraphQLID) },
	},
	resolve: (parent, { ids=["all"] }) => getObjectives(ids),
};

export const queries = {
	objective: ObjectiveQuery,
	objectives: ObjectivesQuery,
};
