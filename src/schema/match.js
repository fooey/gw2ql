
import Promise from 'bluebird';

import {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLID,
    GraphQLInt,
    GraphQLNonNull,

} from 'graphql/type';
import { World } from 'src/schema/world';
import { Objective } from 'src/schema/objective';

import {
	getMatch,
	getMatches,
	getObjectives,
	getWorld,
} from 'src/lib/api';



export const Match = new GraphQLObjectType({
    name: 'Match',
    fields: () => ({
		start_time: { type: GraphQLString },
        id: { type: GraphQLID },
        end_time: { type: GraphQLString },
        scores: { type: MatchScoresType },
        deaths: { type: MatchScoresType },
        kills: { type: MatchScoresType },
        victory_points: { type: MatchScoresType },
        worlds: {
            type: MatchWorlds,
            resolve: ({ worlds }) => Promise.props({
                red: getWorld(worlds.red),
                green: getWorld(worlds.green),
                blue: getWorld(worlds.blue),
            }),
        },
        maps: { type: new GraphQLList(MatchMap) },
    }),
});

export const MatchMap = new GraphQLObjectType({
    name: 'MatchMap',
    fields: () => ({
        id: { type: GraphQLString },
        type: { type: GraphQLString },
        deaths: { type: MatchScoresType },
        kills: { type: MatchScoresType },
        objectives: { type: new GraphQLList(MatchObjective) },
    }),
});


export const MatchWorlds = new GraphQLObjectType({
    name: 'MatchWorlds',
    fields: () => ({
        red: { type: World },
        green: { type: World },
        blue: { type: World },
	}),
});

export const MatchScoresType = new GraphQLObjectType({
    name: 'MatchScoresType',
    fields: {
        red: { type: GraphQLInt },
        green: { type: GraphQLInt },
        blue: { type: GraphQLInt },
    },
});

export const MatchObjective = new GraphQLObjectType({
    name: 'MatchObjective',
    fields: {
        id: { type: GraphQLString },
        type: { type: GraphQLString },
        owner: { type: GraphQLString },
        last_flipped: { type: GraphQLString },
        claimed_by: { type: GraphQLString },
        points_tick: { type: GraphQLInt },
        points_capture: { type: GraphQLInt },
        yaks_delivered: { type: GraphQLInt },
        objective: {
            type: Objective,
            resolve: ({ id }) => getObjectives(id),
        },
    },
});






export const MatchQuery = {
    type: Match,
    args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
    },
    resolve: (parent, { id }) => getMatch(id),
};

export const MatchesQuery = {
    type: new GraphQLList(Match),
    args: {
        ids: { type: new GraphQLList(GraphQLID) },
    },
    resolve: (parent, { ids=["all"] }) => getMatches(ids),
};

export const queries = {
	match: MatchQuery,
	matches: MatchesQuery,
};
