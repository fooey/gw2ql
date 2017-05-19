import _ from 'lodash';

import {
	GraphQLObjectType,
	GraphQLString,
	GraphQLList,
	GraphQLID,
	// GraphQLNonNull,
} from 'graphql/type';

import { langs } from 'src/lib/api/lang';

import {
	getWorld,
	getWorlds,
	getWorldBySlug,
	getWorldMatch,
} from 'src/lib/api';

import { Match } from 'src/schema/match';



export const World = new GraphQLObjectType({
	name: 'World',
	fields: () => _.reduce(langs, (acc, lang) => {
		return _.set(acc, lang.slug, {type: WorldLang});
	}, {
		id: { type: GraphQLID },
		population: { type: GraphQLString },
		region: { type: GraphQLString },
		lang: { type: GraphQLString },
		slugs: { type: new GraphQLList(GraphQLString) },
		match: {
			type: Match,
			resolve: ({ id}) => getWorldMatch(id),
		},
	}),
});

export const WorldLang = new GraphQLObjectType({
	name: 'WorldLang',
	fields: () => ({
		name: { type: GraphQLString },
		slug: { type: GraphQLString },
	}),
});

export const WorldQuery = {
	type: World,
	args: {
		id: { type: GraphQLID },
		slug: { type: GraphQLString },
	},
	resolve: (parent, { id, slug }) => {
		if (!_.isEmpty(id)) {
			return getWorld(id);
		} else if (!_.isEmpty(slug)) {
			return getWorldBySlug(slug);
		}
	},
};

export const WorldsQuery = {
	type: new GraphQLList(World),
	args: {
		ids: { type: new GraphQLList(GraphQLID) },
	},
	resolve: (parent, { ids = ["all"] }) => {
		return getWorlds(ids);
	},
};

export const queries = {
	world: WorldQuery,
	worlds: WorldsQuery,
};
