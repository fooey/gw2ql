import 'app-module-path/cwd';

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import Promise from 'bluebird';
import _ from 'lodash';

import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import { printSchema } from 'graphql/utilities/schemaPrinter';

import schema from 'src/schema/index';

import { init as initApi } from 'src/lib/api';
import { getLang, getLangs } from 'src/lib/api/lang';
import { init as initObjectives, getObjective, getObjectives } from 'src/lib/api/objective';
import { init as initWorlds, getWorld, getWorlds } from 'src/lib/api/world';


const app = express().use('*', cors());


const PORT = 4000;

console.info(Date.now(), 'SERVER', 'Initializing data...');
Promise.all([
	initApi(),
	initWorlds(),
	// initObjectives(),
])
.then(() => console.info(Date.now(), 'SERVER', 'Data initialized, starting...'))
.then(() => {
	console.info(Date.now(), 'SERVER', 'Creating routes...');

	app.use('/graphql', bodyParser.json(), graphqlExpress({ schema, context: {} }));
	app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));
	app.use('/schema', (req, res) => res.type('text/plain').send(printSchema(schema)));

	app.use('/lang/:slug([a-z]{2})', (req, res) => getLang(req.params.slug).then(result => res.json(result)));
	app.use('/lang', (req, res) => getLangs().then(result => res.json(result)));

	app.use('/world/:id([0-9]{4})', (req, res) => getWorld(req.params.id).then(result => res.json(result)));
	app.use('/world', (req, res) => getWorlds().then(result => res.json(result)));


	// app.use('/objective/:id', (req, res) => getObjective(req.params.id).then(result => res.json(result)));
	// app.use('/objective', (req, res) => getObjectives().then(result => res.json(result)));

})
.then(() =>
	app.listen(PORT, () => console.info(Date.now(), 'SERVER', `Now browse to localhost:${PORT}/graphiql`))
)
.catch((err) => console.error(Date.now(), 'SERVER', 'error', err));


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
