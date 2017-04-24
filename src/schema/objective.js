
import _ from 'lodash';

import {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLFloat,
    GraphQLList,
    GraphQLID,
    GraphQLNonNull,
} from 'graphql/type';

import langs from 'src/lib/api/lang';

import {
	getObjectives,
} from 'src/lib/api';



export const ObjectiveType = new GraphQLObjectType({
    name: 'ObjectiveType',
    fields: () => _.reduce(langs, (acc, lang, langSlug) => {
		return _.set(acc, langSlug, { type: ObjectiveLangType });
	}, {
        id: { type: GraphQLString },
        sector_id: { type: GraphQLInt },
        type: { type: GraphQLString },
        map_type: { type: GraphQLString },
        map_id: { type: GraphQLInt },
        coord: { type: new GraphQLList(GraphQLFloat) },
        label_coord: { type: new GraphQLList(GraphQLFloat) },
        marker: { type: GraphQLString },
        chat_link: { type: GraphQLString },
    }),
});

export const ObjectiveLangType = new GraphQLObjectType({
    name: 'ObjectiveLangType',
    fields: () => ({
        name: { type: GraphQLString },
        slug: { type: GraphQLString },
    }),
});

export const ObjectiveQuery = {
    type: ObjectiveType,
    args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
    },
    resolve: (parent, { id }) => getObjectives(id),
};

export const ObjectivesQuery = {
    type: new GraphQLList(ObjectiveType),
    args: {
        ids: { type: new GraphQLList(GraphQLID) },
    },
    resolve: (parent, { ids=["all"] }) => getObjectives(ids),
};

export const queries = {
	objective: ObjectiveQuery,
	objectives: ObjectivesQuery,
};

export default {
	ObjectiveType,
	queries,
};
