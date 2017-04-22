
import Promise from 'bluebird';
import _ from 'lodash';
// import { makeExecutableSchema } from 'graphql-tools';

// import {
//     GraphQLObjectType,
//     GraphQLString,
//     GraphQLInt,
//     GraphQLFloat,
//     GraphQLList,
//     GraphQLID,
//     GraphQLNonNull
// } from 'graphql/type';

import {
	// langs,
	getLang,
	getLangs,
 } from 'src/lib/api/langs';



export const Lang = `
    type Lang {
		slug: String,
		name: String,
		label: String,
	}
`;


// export const LangQuery = {
//     type: Lang,
//     args: {
//         slug: { type: new GraphQLNonNull(GraphQLID), }
//     },
//     resolve: (parent, { slug }) => getLang(slug),
// };
//
// export const LangsQuery = {
//     type: new GraphQLList(Lang),
//     args: {
//         slugs: { type: new GraphQLList(GraphQLID), }
//     },
//     resolve: (parent, { slugs = [] }) => getLangs(slugs),
// };

export const resolvers = {
	Query: {
		lang:  (obj, { slug })  => getLang(slug),
		langs: (obj, { slugs }) => getLangs(slugs),
	},
}

// export const queries = {
// 	lang: LangQuery,
// 	langs: LangsQuery,
// };
//
// export default {
// 	Lang,
// 	// queries,
// 	resolverMap
// };
