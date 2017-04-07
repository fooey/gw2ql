
import axios from 'axios';
import Promise from 'bluebird';
import DataLoader from 'dataloader';

import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
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

const MatchType = new GraphQLObjectType({
  name: 'MatchType',
  fields: {
    id: { type: GraphQLString },
    start_time: { type: GraphQLString },
    end_time: { type: GraphQLString },
    scores: { type: MatchScoresType },
    deaths: { type: MatchScoresType },
    kills: { type: MatchScoresType },
    worlds: { 
      type: MatchWorldsType,
      resolve: (match) => Promise.props({
        red: worldsLoader.load(match.worlds.red),
        green: worldsLoader.load(match.worlds.green),
        blue: worldsLoader.load(match.worlds.blue),
      })
    },
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
      resolve: (parent, { ids }) => matchesLoader.loadMany(ids),
    },
  }
});


function fetch(relativeURL) {
  const fullUrl = `https://api.guildwars2.com${relativeURL}`;
  console.log('fullUrl', fullUrl);
  return axios.get(fullUrl)
    .then(response => response.data)
}

function getWorld(id) {
  console.log('getWorld', id);
  return fetch(`/v2/worlds/${id}`);
}

function getWorlds(ids=['all']) {
  console.log('getWorld', ids);
  
  const idList = [...ids].join(',');
  
  return fetch(`/v2/worlds?ids=${idList}`);
}


const worldsLoader = new DataLoader(
  worldIds => {
    console.log('worldsLoader', worldIds);
    return getWorlds(worldIds);
  }
);


function getMatch(id) {
  console.log('getMatch', id);
  return fetch(`/v2/wvw/matches/${id}`);
}

function getMatches(ids=['all']) {
  console.log('getMatches', ids);
  
  const idList = [...ids].join(',');
  
  return fetch(`/v2/wvw/matches?ids=${idList}`); 
}


const matchesLoader = new DataLoader(
  matchIds => {
    console.log('matchesLoader', matchIds);
    return getMatches(matchIds);
  }
);


const schema = new GraphQLSchema({ query: RootType });
export default schema;