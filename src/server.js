import 'app-module-path/cwd';

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';

import Promise from 'bluebird';
import _ from 'lodash';

import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import { printSchema } from 'graphql/utilities/schemaPrinter';

import schema from 'src/schema/index';

import { init as initApi } from 'src/lib/api';
import { getLang, getLangs } from 'src/lib/api/lang';
import { init as initObjectives, getObjective, getObjectives } from 'src/lib/api/objective';
import { init as initWorlds, getWorld, getWorlds } from 'src/lib/api/world';
import { init as initMatches, getMatch, getMatches } from 'src/lib/api/match';

const ENV = _.get(process, 'env.NODE_ENV', 'development');
global.isDev = ENV === 'development';


const app = express();

if (global.isDev) {
	app.use(morgan('tiny'))
}

app.use('*', cors());


const PORT = 4000;

console.info(Date.now(), 'SERVER', 'Initializing data...');
Promise.all([
	initApi(),
	initWorlds(),
	initObjectives(),
	initMatches(),
])
.then(() => console.info(Date.now(), 'SERVER', 'Data initialized, starting...'))
.then(() => {
	console.info(Date.now(), 'SERVER', 'Creating routes...');

	app.use('/graphql', bodyParser.json(), graphqlExpress({ schema, context: {} }));
	app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));
	app.use('/schema', (req, res) => res.type('text/plain').send(printSchema(schema)));

	app.use('/lang/:slug([a-z]{2})', (req, res) => getLang(req.params.slug).then(result => res.json(result)));
	app.use(['/lang', '/langs'], (req, res) => getLangs().then(result => res.json(result)));

	app.use('/world/:id([0-9]{4})', (req, res) => getWorld(req.params.id).then(result => res.json(result)));
	app.use(['/world', '/worlds'], (req, res) => getWorlds().then(result => res.json(result)));

	app.use('/objective/:id', (req, res) => getObjective(req.params.id).then(result => res.json(result)));
	app.use(['/objective', '/objectives'], (req, res) => getObjectives().then(result => res.json(result)));

	app.use('/match/:id', (req, res) => getMatch(req.params.id).then(result => res.json(result)));
	app.use(['/match', '/matches'], (req, res) => getMatches().then(result => res.json(result)));
})
.then(() =>
	app.listen(PORT, () => console.info(Date.now(), 'SERVER', `Now browse to localhost:${PORT}/graphiql`))
)
.catch((err) => console.error(Date.now(), 'SERVER', 'error', err));
