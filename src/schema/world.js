
import Promise from 'bluebird';
import _ from 'lodash';

import {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLID,
    GraphQLNonNull
} from 'graphql/type';

import { langs, getLangs } from 'src/lib/api/lang';

import {
	getWorld,
	getWorlds,
} from 'src/lib/api';


export const World = new GraphQLObjectType({
    name: 'World',
    fields: () => _.reduce(langs, (acc, lang) => {
		return _.set(acc, lang.slug, { type: WorldLang });
	}, {
        id: { type: GraphQLString },
		population: { type: GraphQLString },
		slugs: { type: new GraphQLList(GraphQLString) },
    })
});

export const WorldLang = new GraphQLObjectType({
    name: 'WorldLang',
    fields: () => ({
        name: { type: GraphQLString },
        slug: { type: GraphQLString },
    })
});


export const WorldQuery = {
    type: World,
    args: {
        id: { type: new GraphQLNonNull(GraphQLID), }
    },
    resolve: (parent, { id }) => getWorld(id),
};

export const WorldsQuery = {
    type: new GraphQLList(World),
    args: {
        ids: { type: new GraphQLList(GraphQLID), }
    },
    resolve: (parent, { ids=["all"] }) => {
		return getWorlds(ids);
    },
};

export const queries = {
	world: WorldQuery,
	worlds: WorldsQuery,
};
