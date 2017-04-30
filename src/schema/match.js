
import Promise from 'bluebird';
import _ from 'lodash';

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
	getObjective,
	getWorld,
	getWorlds,
} from 'src/lib/api';



export const Match = new GraphQLObjectType({
    name: 'Match',
    fields: () => ({
		start_time: { type: GraphQLString },
        id: { type: GraphQLID },
        end_time: { type: GraphQLString },
        scores: { type: MatchScores },
        deaths: { type: MatchScores },
        kills: { type: MatchScores },
        victory_points: { type: MatchScores },
        worlds: {
            type: MatchWorlds,
            resolve: ({ worlds }) => Promise.props({
                red: getWorld(worlds.red),
                green: getWorld(worlds.green),
                blue: getWorld(worlds.blue),
            }),
        },
        all_worlds: {
            type: MatchAllWorlds,
            resolve: ({ all_worlds }) => Promise.props({
				red: getWorlds(all_worlds.red),
				green: getWorlds(all_worlds.green),
				blue: getWorlds(all_worlds.blue),
			}),
        },
        maps: { type: new GraphQLList(MatchMap) },
        skirmishes: { type: new GraphQLList(MatchSkirmish) },

        region: { type: GraphQLString },
    }),
});

export const MatchMap = new GraphQLObjectType({
    name: 'MatchMap',
    fields: () => ({
        id: { type: GraphQLString },
        type: { type: GraphQLString },
        deaths: { type: MatchScores },
        kills: { type: MatchScores },
        scores: { type: MatchScores },
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

export const MatchAllWorlds = new GraphQLObjectType({
    name: 'MatchAllWorlds',
    fields: () => ({
        red: { type: new GraphQLList(World) },
        green: { type: new GraphQLList(World) },
        blue: { type: new GraphQLList(World) },
	}),
});

export const MatchScores = new GraphQLObjectType({
    name: 'MatchScores',
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
            resolve: ({ id }) => getObjective(id),
        },
    },
});


export const MatchSkirmish = new GraphQLObjectType({
    name: 'MatchSkirmish',
    fields: () => ({
        id: { type: GraphQLString },
        scores: { type: MatchScores },
        map_scores: { type: new GraphQLList(MatchSkirmishMapScores) },
    }),
});

export const MatchSkirmishMapScores = new GraphQLObjectType({
    name: 'MatchSkirmishMapScores',
    fields: () => ({
        type: { type: GraphQLString },
        scores: { type: MatchScores },
    }),
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
        region: { type: GraphQLString },
    },
    resolve: (parent, { ids=["all"], region }) => {
		return getMatches(ids).then(result => {

			if (!_.isEmpty(region) && !_.isEmpty(result)) {
				result = _.filter(result, { region });
			}

			return result;
		});
	},
};

export const queries = {
	match: MatchQuery,
	matches: MatchesQuery,
};
