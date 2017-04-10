import express from 'express';
import bodyParser from 'body-parser';

import {
	graphqlExpress,
	graphiqlExpress,
} from 'graphql-server-express';


import schema from './schema';

const app = express();
app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));
app.use('/graphiql', graphiqlExpress({endpointURL: '/graphql'}));
app.listen(4000, () => console.log('Now browse to localhost:4000/graphiql'));

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


 */
