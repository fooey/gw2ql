
import axios from 'axios';
import Promise from 'bluebird';

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
        red: getWorld(match.worlds.red),
        green: getWorld(match.worlds.green),
        blue: getWorld(match.worlds.blue),
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
      resolve: (parent, { ids }) => getWorlds(ids),
    },
    
    match: {
      type: MatchType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID), }
      },
      resolve: (parent, { id }) => getMatch(id),
    },
    matches: {
      type: new GraphQLList(MatchType),
      args: {
        ids: { type: new GraphQLList(GraphQLID), }
      },
      resolve: (parent, { ids }) => getMatches(ids),
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

function getWorlds(ids='all') {
  console.log('getWorld');
  return fetch(`/v2/worlds?ids=${ids}`);
}

function getMatch(id) {
  console.log('getMatch', id);
  if (id === 'all') {
    return fetch(`/v2/wvw/matches?ids=all`);     
  } else {
    return fetch(`/v2/wvw/matches/${id}`);
  }
}

function getMatches(ids=['all']) {
  console.log('getMatches', ids);
  if (!Array.isArray(ids)) {
    ids = ids.split(',');
  }
  
  return Promise.map(ids, id => getMatch(id));
}


const schema = new GraphQLSchema({ query: RootType });
export default schema;