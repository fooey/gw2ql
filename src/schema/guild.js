
import {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLList,
    GraphQLID,
} from 'graphql/type';

import {
	getGuild,
	getGuilds,
} from 'src/lib/api';



export const Guild = new GraphQLObjectType({
    name: 'Guild',
    fields:  {
        id: { type: GraphQLString },
        level: { type: GraphQLInt },
		motd: { type: GraphQLString },
		influence: { type: GraphQLInt },
		aetherium: { type: GraphQLString },
		favor: { type: GraphQLInt },
		name: { type: GraphQLString },
		tag: { type: GraphQLString },
		emblem: { type: GraphQLString },
    },
});

export const GuildQuery = {
    type: Guild,
    args: {
		id: { type: GraphQLID },
    },
    resolve: (parent, { id }) => getGuild(id),
};

export const GuildsQuery = {
    type: new GraphQLList(Guild),
    args: {
        ids: { type: new GraphQLList(GraphQLID) },
    },
    resolve: (parent, { ids }) => getGuilds(ids),
};

export const queries = {
	guild: GuildQuery,
	guilds: GuildsQuery,
};
