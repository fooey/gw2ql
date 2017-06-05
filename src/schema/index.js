import {
	GraphQLSchema,
	GraphQLObjectType,
} from 'graphql/type';

import _ from 'lodash';

import { queries as langQueries } from 'src/schema/lang';
import { queries as guildQueries } from 'src/schema/guild';
import { queries as objectiveQueries } from 'src/schema/objective';
import { queries as worldQueries } from 'src/schema/world';
import { queries as matchesQueries } from 'src/schema/match';
import { queries as teamStatsQueries } from 'src/schema/teamStat';



const RootType = new GraphQLObjectType({
	name: 'RootType',
	fields: _.merge(
		langQueries,
		guildQueries,
		objectiveQueries,
		worldQueries,
		matchesQueries,
		teamStatsQueries,
	),
});

export default new GraphQLSchema({ query: RootType });
