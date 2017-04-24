
import {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLID,
    GraphQLNonNull,
} from 'graphql/type';

import {
	// langs,
	getLang,
	getLangs,
 } from 'src/lib/api/lang';



export const Lang = new GraphQLObjectType({
    name: 'Lang',
    fields: () => ({
        slug: { type: GraphQLString },
        name: { type: GraphQLString },
        label: { type: GraphQLString },
    }),
});


export const LangQuery = {
    type: Lang,
    args: {
        slug: { type: new GraphQLNonNull(GraphQLID) },
    },
    resolve: (parent, { slug }) => getLang(slug),
};

export const LangsQuery = {
    type: new GraphQLList(Lang),
    args: {
        slugs: { type: new GraphQLList(GraphQLID) },
    },
    resolve: (parent, { slugs = [] }) => getLangs(slugs),
};

export const queries = {
	lang: LangQuery,
	langs: LangsQuery,
};
