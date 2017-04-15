import "app-module-path/cwd";

import express from 'express';
import bodyParser from 'body-parser';

import GraphQLSchema from './schema/index';

import { GraphQLOptions } from 'graphql-server-core';
import {
	graphqlExpress,
	graphiqlExpress,
 } from 'graphql-server-express';

 // options object
const myGraphQLOptions = {
  schema: GraphQLSchema,

  // // values to be used as context and rootValue in resolvers
  // context?: any,
  // rootValue?: any,
  //
  // // function used to format errors before returning them to clients
  // formatError?: Function,
  //
  // // additional validation rules to be applied to client-specified queries
  // validationRules?: Array<ValidationRule>,
  //
  // // function applied for each query in a batch to format parameters before passing them to `runQuery`
  // formatParams?: Function,
  //
  // // function applied to each response before returning data to clients
  // formatResponse?: Function,
  //
  // // a boolean option that will trigger additional debug logging if execution errors occur
  debug: true
};

const app = express();

app.use( '/graphql', bodyParser.json(), graphqlExpress(myGraphQLOptions) );
app.use( '/graphiql', graphiqlExpress({ endpointURL: '/graphql', }) );


// app.use('/graphiql', graphiqlExpress({endpointURL: '/graphql'}));
// app.listen(4000, () => console.log('Now browse to localhost:4000/graphiql'));

/*

{
  match(id: "1-1,1-2") {
    id
    worlds {
      red
      blue
      green
    }
    scores {
      red
      blue
      green
    }
    start_time
    end_time
  }

  world(id: "1019") {
    id
    name
  }
}

{
  match(id: "1-1") {
    id
    start_time
    end_time
    scores { red, blue, green }
    deaths { red, blue, green }
    kills { red, blue, green }
    worlds {
      red { id, name }
      blue { id, name }
      green { id, name }
    }
  }
}

{
  matches(ids: "1-1") {
    id
    start_time
    end_time
    scores { red green blue }
    deaths { red blue green }
    kills { red blue green }
    victory_points { red blue green }
    worlds {
      red { id name }
      blue { id name }
      green { id name }
    }
    maps {
      id
      type
      deaths { red green blue }
      kills { red green blue }
      objectives {
        id type
        owner last_flipped claimed_by
        points_tick points_capture yaks_delivered
        objective {
          id name type
          map_type map_id sector_id
          coord label_coord
          marker chat_link
        }
      }
    }
  }
}


{
  us1: match(id: "1-1") {
    ...matchFields
  }
  eu1: match(id: "2-1") {
    ...matchFields
  }
  matches {
    ...matchFields
  }
}

fragment matchFields on MatchType {
  id
  start_time
  scores { red green blue }
  worlds {
    red { id name }
    blue { id name }
    green { id name }
  }
}






 */
