
import Promise from 'bluebird';
import _ from 'lodash';

import {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLFloat,
    GraphQLList,
    GraphQLID,
    GraphQLNonNull
} from 'graphql/type';

import {
	// langs,
	getLang,
	getLangs,
 } from 'src/lib/api/langs';



export const LangType = new GraphQLObjectType({
    name: 'LangType',
    fields: () => ({
        slug: { type: GraphQLString },
        name: { type: GraphQLString },
        label: { type: GraphQLString },
    })
});


export const LangQuery = {
    type: LangType,
    args: {
        slug: { type: new GraphQLNonNull(GraphQLID), }
    },
    resolve: (parent, { slug }) => getLang(slug),
};

export const LangsQuery = {
    type: new GraphQLList(LangType),
    args: {
        slugs: { type: new GraphQLList(GraphQLID), }
    },
    resolve: (parent, { slugs = [] }) => getLangs(slugs),
};

export const queries = {
	lang: LangQuery,
	langs: LangsQuery,
};

export default {
	LangType,
	queries
};
