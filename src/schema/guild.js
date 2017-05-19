
import {
	GraphQLObjectType,
	GraphQLString,
	GraphQLList,
	GraphQLID,
} from 'graphql/type';

import {
	getGuild,
	getGuilds,
} from 'src/lib/api';



export const Guild = new GraphQLObjectType({
	name: 'Guild',
	fields: () => ({
		id: { type: GraphQLID },
		name: { type: GraphQLString },
		tag: { type: GraphQLString },
		emblem: { type: GuildEmblem },
	}),
});

export const GuildEmblem = new GraphQLObjectType({
	name: 'GuildEmblem',
	fields: () => ({
		background: { type: GuildEmblemLayer },
		foreground: { type: GuildEmblemLayer },
		flags: { type: new GraphQLList(GraphQLString) },
	}),
});

export const GuildEmblemLayer = new GraphQLObjectType({
	name: 'GuildEmblemLayer',
	fields: () => ({
		id: { type: GraphQLID },
		colors: { type: new GraphQLList(GraphQLID) },
	}),
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
