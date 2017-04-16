
import DataLoader from 'dataloader';
import _ from 'lodash';
import LRU from 'lru-cache';

import {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLID,
    GraphQLNonNull
} from 'graphql/type';

import {
	fetchWorlds,
	getWorld,
	getWorlds,
	CACHE_LONG,
	langs,
} from 'src/lib/api';


export const WorldType = new GraphQLObjectType({
    name: 'WorldType',
    fields: () => _.reduce(langs, (acc, lang, langSlug) => {
		return _.set(acc, langSlug, { type: WorldLangType });
	}, {
        id: { type: GraphQLString },
		population: { type: GraphQLString },
    })
});

export const WorldLangType = new GraphQLObjectType({
    name: 'WorldLangType',
    fields: () => ({
        name: { type: GraphQLString },
        slug: { type: GraphQLString },
    })
});


export const WorldQuery = {
    type: WorldType,
    args: {
        id: { type: new GraphQLNonNull(GraphQLID), }
    },
    resolve: (parent, { id }) => getWorld(id),
};

export const WorldsQuery = {
    type: new GraphQLList(WorldType),
    args: {
        ids: { type: new GraphQLList(GraphQLID), }
    },
    resolve: (parent, { ids=["all"] }) => {
		return getWorlds(ids);
    },
};

export const worldsLoader = new DataLoader(
    worldIds => getWorlds(worldIds),
    { cacheMap: LRU({ maxAge: CACHE_LONG })}
);

export const queries = {
	world: WorldQuery,
	worlds: WorldsQuery,
};


export default {
	WorldType,
	queries,
	worldsLoader,
};
