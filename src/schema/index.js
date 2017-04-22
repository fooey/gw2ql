
import Promise from 'bluebird';
import { makeExecutableSchema } from 'graphql-tools';


// import Objective from 'src/schema/objective';
// import World from 'src/schema/world';
import {
	Lang,
	resolvers as langResolvers
} from 'src/schema/lang';



const Query = `
	type Query {
		lang(slug: String!): Lang,
		langs(slugs: [String!]): [Lang],
	}
`;

const SchemaDefinition = `
	schema {
		query: Query
	}
`;


const executableSchema = makeExecutableSchema({
  typeDefs: [
	  SchemaDefinition,
	  Query,
	  Lang,
  ],
  resolvers: Object.assign({},
	  langResolvers
  ),
  logger: { log: (e) => console.log(e) },
  allowUndefinedInResolve: false,
});

export default executableSchema;



// const MatchWorldsType = new GraphQLObjectType({
//     name: 'MatchWorldsType',
//     fields: {
//         red: { type: World.WorldType },
//         green: { type: World.WorldType },
//         blue: { type: World.WorldType },
// }
// });
//
// const MatchScoresType = new GraphQLObjectType({
//     name: 'MatchScoresType',
//     fields: {
//         red: { type: GraphQLInt },
//         green: { type: GraphQLInt },
//         blue: { type: GraphQLInt },
//     }
// });
//
// const MatchObjectiveType = new GraphQLObjectType({
//     name: 'MatchObjectiveType',
//     fields: {
//         id: { type: GraphQLString },
//         type: { type: GraphQLString },
//         owner: { type: GraphQLString },
//         last_flipped: { type: GraphQLString },
//         claimed_by: { type: GraphQLString },
//         points_tick: { type: GraphQLInt },
//         points_capture: { type: GraphQLInt },
//         yaks_delivered: { type: GraphQLInt },
//         objective: {
//             type: Objective.ObjectiveType,
//             resolve: ({ id }) => getObjectives(id),
//         },
//     }
// });
//
// const MatchMapType = new GraphQLObjectType({
//     name: 'MatchMapType',
//     fields: {
//         id: { type: GraphQLString },
//         type: { type: GraphQLString },
//         deaths: { type: MatchScoresType },
//         kills: { type: MatchScoresType },
//         objectives: { type: new GraphQLList(MatchObjectiveType) }
//     }
// });
//
// const MatchType = new GraphQLObjectType({
//     name: 'MatchType',
//     fields: {
//         id: { type: GraphQLString },
//         start_time: { type: GraphQLString },
//         end_time: { type: GraphQLString },
//         scores: { type: MatchScoresType },
//         deaths: { type: MatchScoresType },
//         kills: { type: MatchScoresType },
//         victory_points: { type: MatchScoresType },
//         worlds: {
//             type: MatchWorldsType,
//             resolve: ({ worlds }) => Promise.props({
//                 red: World.worldsLoader.load(worlds.red),
//                 green: World.worldsLoader.load(worlds.green),
//                 blue: World.worldsLoader.load(worlds.blue),
//             })
//         },
//         maps: { type: new GraphQLList(MatchMapType) },
//     }
// });
//
//
// const MatchQuery = {
//     type: MatchType,
//     args: {
//         id: { type: new GraphQLNonNull(GraphQLID), }
//     },
//     resolve: (parent, { id }) => matchesLoader.load(id),
// };
//
// const MatchesQuery = {
//     type: new GraphQLList(MatchType),
//     args: {
//         ids: { type: new GraphQLList(GraphQLID), }
//     },
//     resolve: (parent, { ids=["all"] }) => {
//         if (ids.indexOf('all') !== -1 || !Array.isArray(ids) || ids.length === 0) {
//             return fetch(`/v2/wvw/matches`).then(ids => matchesLoader.loadMany(ids));
//         } else {
//             return matchesLoader.loadMany(ids);
//         }
//     },
// };


// const RootType = new GraphQLObjectType({
//   name: 'RootType',
//   fields: Object.assign(
// 	//   Objective.queries,
// 	  World.queries,
// 	//   Lang.queries,
// 	//   {
// 	//     match: MatchQuery,
// 	//     matches: MatchesQuery,
// 	// }
//     )
// });

// const matchesLoader = new DataLoader(
//     matchIds => getMatches(matchIds),
//     { cacheMap: LRU({ maxAge: CACHE_SHORT })}
// );



// const schema = new GraphQLSchema({ query: RootType });
// export default schema;
