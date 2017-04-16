import 'app-module-path/cwd';

import express from 'express';
import bodyParser from 'body-parser';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import Promise from 'bluebird';

import schema from 'src/schema/index';

import { getLangs } from 'src/lib/api/langs';
import { init as initWorlds, getWorlds } from 'src/lib/api/world';

const app = express();

console.log('Initializing data');
Promise.props({
	worlds: initWorlds(),
}).then(() => {
	console.log('Data initialized, starting server');
	app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));
	app.use('/graphiql', graphiqlExpress({endpointURL: '/graphql'}));

	app.use('/langs', (req, res) => getLangs().then(langs => res.json(langs)));
	app.use('/worlds', (req, res) => getWorlds().then(worlds => res.json(worlds)));

	app.listen(4000, () => console.log('Now browse to localhost:4000/graphiql'));
});


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
