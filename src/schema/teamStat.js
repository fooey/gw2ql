
// import Promise from 'bluebird';
// import _ from 'lodash';

import {
	GraphQLObjectType,
	GraphQLString,
	GraphQLList,
	GraphQLID,
	GraphQLFloat,
	GraphQLNonNull,

} from 'graphql/type';
import { MatchScores } from 'src/schema/match';

import { getTeamStats } from 'src/lib/api/teamStat';



export const Stat = new GraphQLObjectType({
	name: 'Stat',
	fields: () => ({
		type: { type: GraphQLString },
		red: { type: new GraphQLList(Team) },
		blue: { type: new GraphQLList(Team) },
		green: { type: new GraphQLList(Team) },
	}),
});

export const Team = new GraphQLObjectType({
	name: 'Team',
	fields: () => ({
		guild_id: { type: GraphQLString },
		kills: { type: MatchScores },
		deaths: { type: MatchScores },
		wilson: { type: GraphQLFloat },
	}),
});



// export const TeamsQuery = {
// 	type: Teams,
// 	args: {
// 		id: { type: new GraphQLNonNull(GraphQLID) },
// 		color: { type: new GraphQLNonNull(GraphQLString) },
// 		stat: { type: new GraphQLNonNull(GraphQLString) },
// 	},
// 	resolve: (parent, { id, color, stat }) => getTeamStat(id, color, stat),
// };

export const TeamStatsQuery = {
	type: new GraphQLList(Stat),
	args: {
		id: { type: new GraphQLNonNull(GraphQLID) },
	},
	resolve: (parent, { id }) => getTeamStats(id),
};



// function resolveTeam({ id, color, stat }) {
// 	if (!_.isEmpty(id)) {
// 		if (!_.isEmpty(color) || !_.isEmpty(stat)) {
// 			if (!_.isEmpty(color) && _.isEmpty(stat)) {
// 				return getTeamStat(id, color, stat);
// 			} else if (!_.isEmpty(color) && _.isEmpty(stat)) {
// 				return getTeamStatsByColor(id, color);
// 			} else if (!_.isEmpty(stat) && _.isEmpty(color)) {
// 				return getMatchStatsByType(id, stat);
// 			}
// 		} else {
// 			return getTeamStats(id);
// 		}
// 	}
// }





export const queries = {
	// team_stat: TeamsQuery,
	team_stats: TeamStatsQuery,
	// team_stat_colors: {},
	// team_color_stats: {},
};
