
import axios from 'axios';
import Promise from 'bluebird';
import DataLoader from 'dataloader';

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
      resolve: (match) => Promise.props({
        red: worldsLoader.load(match.worlds.red),
        green: worldsLoader.load(match.worlds.green),
        blue: worldsLoader.load(match.worlds.blue),
      })
    },
    maps: { type: new GraphQLList(MatchMapType) },
  }
});



const RootType = new GraphQLObjectType({
  name: 'RootType',
  fields: {
    world: {
      type: WorldType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID), }
      },
      resolve: (parent, { id }) => getWorld(id),
    },
    worlds: {
      type: new GraphQLList(WorldType),
      args: {
        ids: { type: new GraphQLNonNull(GraphQLID), }
      },
      resolve: (parent, { ids }) => worldsLoader.load(ids),
    },

    match: {
      type: MatchType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID), }
      },
      resolve: (parent, { id }) => matchesLoader.load(id),
    },
    matches: {
      type: new GraphQLList(MatchType),
      args: {
        ids: { type: new GraphQLList(GraphQLID), }
      },
      resolve: (parent, { ids=["all"] }) => {
          if (ids.indexOf('all') !== -1 || !Array.isArray(ids) || ids.length === 0) {
              return getMatches(['all']);
          } else {
              return matchesLoader.loadMany(ids);
          }
      },
    },
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
  // console.log('getWorld', ids);

  const idList = [...ids].join(',');

  return fetch(`/v2/worlds?ids=${idList}`);
}

const worldsLoader = new DataLoader(
  worldIds => {
    // console.log('worldsLoader', worldIds);
    return getWorlds(worldIds);
  }
);



function getMatch(id) {
  // console.log('getMatch', id);
  return fetch(`/v2/wvw/matches/${id}`);
}

function getMatches(ids=['all']) {
  // console.log('getMatches', ids);

  const idList = [...ids].join(',');

  return fetch(`/v2/wvw/matches?ids=${idList}`);
}

const matchesLoader = new DataLoader(
  matchIds => {
    // console.log('matchesLoader', matchIds);
    return getMatches(matchIds);
}, { cache: false }
);



function getObjective(id) {
  // console.log('getObjective', id);
  return fetch(`/v2/wvw/objectives/${id}`);
}

function getObjectives(ids=['all']) {
  // console.log('getObjectives', ids);

  const idList = [...ids].join(',');

  return fetch(`/v2/wvw/objectives?ids=${idList}`);
}

const objectivesLoader = new DataLoader(
  objectiveIds => {
    // console.log('objectivesLoader', objectiveIds);
    return getObjectives(objectiveIds);
});


const schema = new GraphQLSchema({ query: RootType });
export default schema;
