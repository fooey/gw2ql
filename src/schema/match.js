
import Promise from 'bluebird';
import _ from 'lodash';

import {
	GraphQLObjectType,
	GraphQLString,
	GraphQLList,
	GraphQLID,
	GraphQLInt,
	// GraphQLNonNull,

} from 'graphql/type';
import { World } from 'src/schema/world';
import { Objective } from 'src/schema/objective';

import {
	getMatch,
	getMatches,
	getObjective,
	getWorld,
	getWorlds,
	getWorldMatch,
	getWorldBySlug,
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
				red_id: Promise.resolve(worlds.red),
				green_id: Promise.resolve(worlds.green),
				blue_id: Promise.resolve(worlds.blue),

				red: getWorld(worlds.red),
				green: getWorld(worlds.green),
				blue: getWorld(worlds.blue),
			}),
		},
		all_worlds: {
			type: MatchAllWorlds,
			resolve: ({ all_worlds }) => Promise.props({
				red_ids: Promise.resolve(all_worlds.red),
				green_ids: Promise.resolve(all_worlds.green),
				blue_ids: Promise.resolve(all_worlds.blue),

				red: getWorlds(all_worlds.red),
				green: getWorlds(all_worlds.green),
				blue: getWorlds(all_worlds.blue),
			}),
		},
		maps: { type: new GraphQLList(MatchMap) },
		skirmishes: { type: new GraphQLList(MatchSkirmish) },
		region: { type: GraphQLString },
		world_ids: {
			type: new GraphQLList(GraphQLID),
			// resolve: ({ all_worlds}) => Promise.resolve(_.flatten(_.values(all_worlds))),
		},
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
		red_id: { type: GraphQLID },
		green_id: { type: GraphQLID },
		blue_id: { type: GraphQLID },

		red: { type: World },
		green: { type: World },
		blue: { type: World },
	}),
});

export const MatchAllWorlds = new GraphQLObjectType({
	name: 'MatchAllWorlds',
	fields: () => ({
		red_ids: { type: new GraphQLList(GraphQLID) },
		green_ids: { type: new GraphQLList(GraphQLID) },
		blue_ids: { type: new GraphQLList(GraphQLID) },

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
		id: { type: GraphQLID },
		world_id: { type: GraphQLID },
		world_slug: { type: GraphQLString },
	},
	resolve: (parent, { id, world_id, world_slug }) => {
		if (!_.isEmpty(id)) {
			return getMatch(id);
		} else if (!_.isEmpty(world_id)) {
			return getWorldMatch(world_id);
		} else if (!_.isEmpty(world_slug)) {
			return getWorldBySlug(world_slug).then(world => getWorldMatch(world.id));
		}
	},
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
