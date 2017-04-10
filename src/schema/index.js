
import axios from 'axios';
import Promise from 'bluebird';
import DataLoader from 'dataloader';
import LRU  from 'lru-cache';

import {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLFloat,
    GraphQLList,
    GraphQLID,
    GraphQLNonNull
} from 'graphql/type';

const CACHE_LONG = 1000 * 60 * 60;
const CACHE_SHORT = 1000 * 5;


const WorldType = new GraphQLObjectType({
    name: 'WorldType',
    fields: {
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        population: { type: GraphQLString },
    }
});

const ObjectiveType = new GraphQLObjectType({
    name: 'ObjectiveType',
    fields: {
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        sector_id: { type: GraphQLInt },
        type: { type: GraphQLString },
        map_type: { type: GraphQLString },
        map_id: { type: GraphQLInt },
        coord: { type: new GraphQLList(GraphQLFloat) },
        label_coord: { type: new GraphQLList(GraphQLFloat) },
        marker: { type: GraphQLString },
        chat_link: { type: GraphQLString },
    }
});


const MatchWorldsType = new GraphQLObjectType({
    name: 'MatchWorldsType',
    fields: {
        red: { type: WorldType },
        green: { type: WorldType },
        blue: { type: WorldType },
}
});

const MatchScoresType = new GraphQLObjectType({
    name: 'MatchScoresType',
    fields: {
        red: { type: GraphQLInt },
        green: { type: GraphQLInt },
        blue: { type: GraphQLInt },
    }
});

const MatchObjectiveType = new GraphQLObjectType({
    name: 'MatchObjectiveType',
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
            type: ObjectiveType,
            resolve: ({ id }) => objectivesLoader.load(id),
        },
    }
});

const MatchMapType = new GraphQLObjectType({
    name: 'MatchMapType',
    fields: {
        id: { type: GraphQLString },
        type: { type: GraphQLString },
        deaths: { type: MatchScoresType },
        kills: { type: MatchScoresType },
        objectives: { type: new GraphQLList(MatchObjectiveType) }
    }
});

const MatchType = new GraphQLObjectType({
    name: 'MatchType',
    fields: {
        id: { type: GraphQLString },
        start_time: { type: GraphQLString },
        end_time: { type: GraphQLString },
        scores: { type: MatchScoresType },
        deaths: { type: MatchScoresType },
        kills: { type: MatchScoresType },
        victory_points: { type: MatchScoresType },
        worlds: {
            type: MatchWorldsType,
            resolve: ({ worlds }) => Promise.props({
                red: worldsLoader.load(worlds.red),
                green: worldsLoader.load(worlds.green),
                blue: worldsLoader.load(worlds.blue),
            })
        },
        maps: { type: new GraphQLList(MatchMapType) },
    }
});


const WorldQuery = {
    type: WorldType,
    args: {
        id: { type: new GraphQLNonNull(GraphQLID), }
    },
    resolve: (parent, { id }) => worldsLoader.load(id),
};

const WorldsQuery = {
    type: new GraphQLList(WorldType),
    args: {
        ids: { type: new GraphQLList(GraphQLID), }
    },
    resolve: (parent, { ids=["all"] }) => {
        if (ids.indexOf('all') !== -1 || !Array.isArray(ids) || ids.length === 0) {
            return fetch(`/v2/worlds`).then(ids => worldsLoader.loadMany(ids));
        } else {
            return worldsLoader.loadMany(ids);
        }
    },
}


const MatchQuery = {
    type: MatchType,
    args: {
        id: { type: new GraphQLNonNull(GraphQLID), }
    },
    resolve: (parent, { id }) => matchesLoader.load(id),
};

const MatchesQuery = {
    type: new GraphQLList(MatchType),
    args: {
        ids: { type: new GraphQLList(GraphQLID), }
    },
    resolve: (parent, { ids=["all"] }) => {
        if (ids.indexOf('all') !== -1 || !Array.isArray(ids) || ids.length === 0) {
            return fetch(`/v2/wvw/matches`).then(ids => matchesLoader.loadMany(ids));
        } else {
            return matchesLoader.loadMany(ids);
        }
    },
};


const ObjectiveQuery = {
    type: ObjectiveType,
    args: {
        id: { type: new GraphQLNonNull(GraphQLID), }
    },
    resolve: (parent, { id }) => objectivesLoader.load(id),
};

const ObjectivesQuery = {
    type: new GraphQLList(ObjectiveType),
    args: {
        ids: { type: new GraphQLList(GraphQLID), }
    },
    resolve: (parent, { ids=["all"] }) => {
        if (ids.indexOf('all') !== -1 || !Array.isArray(ids) || ids.length === 0) {
            return fetch(`/v2/wvw/objectives`).then(ids => objectivesLoader.loadMany(ids));
        } else {
            return objectivesLoader.loadMany(ids);
        }
    },
};


const RootType = new GraphQLObjectType({
  name: 'RootType',
  fields: {
    world: WorldQuery,
    worlds: WorldsQuery,

    match: MatchQuery,
    matches: MatchesQuery,

    objective: ObjectiveQuery,
    objectives: ObjectivesQuery,
  }
});


function fetch(relativeURL) {
    const fetchUrl = `https://api.guildwars2.com${relativeURL}`;
    console.log('fetchUrl', fetchUrl);
    return axios.get(fetchUrl)
        .then(response => response.data)
}


function getWorld(id) {
    // console.log('getWorld', id);
    return fetch(`/v2/worlds/${id}`);
}

function getWorlds(ids=['all']) {
    const idList = [...ids].join(',');

    return fetch(`/v2/worlds?ids=${idList}`);
}

const worldsLoader = new DataLoader(
    worldIds => getWorlds(worldIds.sort()),
    { cacheMap: LRU({ maxAge: CACHE_LONG })
});


function getMatch(id) {
    return fetch(`/v2/wvw/matches/${id}`);
}

function getMatches(ids=['all']) {
    const idList = [...ids].join(',');

    return fetch(`/v2/wvw/matches?ids=${idList}`);
}

const matchesLoader = new DataLoader(
    matchIds => getMatches(matchIds.sort()),
    { cacheMap: LRU({ maxAge: CACHE_SHORT })
});



function getObjective(id) {
    return fetch(`/v2/wvw/objectives/${id}`);
}

function getObjectives(ids=['all']) {
    const idList = [...ids].join(',');

    return fetch(`/v2/wvw/objectives?ids=${idList}`);
}

const objectivesLoader = new DataLoader(
    objectiveIds => getObjectives(objectiveIds.sort()),
    { cacheMap: LRU({ maxAge: CACHE_LONG })
});


const schema = new GraphQLSchema({ query: RootType });
export default schema;
