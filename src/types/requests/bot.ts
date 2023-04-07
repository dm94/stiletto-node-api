import { Languages } from '@customtypes/discordconfig';
import { WalkerUse } from '@customtypes/walkers';
import { RequestGenericInterface } from 'fastify/types/request';

export interface GetDiscordServerRequest extends RequestGenericInterface {
  Params: {
    discordid: string;
  };
}

export interface UpdateBotConfigByServerRequest extends RequestGenericInterface {
  Querystring: {
    languaje?: Languages;
    clanlog?: boolean;
    kick?: boolean;
    readypvp?: boolean;
    walkeralarm?: boolean;
  };
  Params: {
    discordid: string;
  };
}

export interface GetWalkersByServerRequest extends RequestGenericInterface {
  Querystring: {
    discordid: string;
    pageSize?: number;
    page?: number;
    name?: string;
    owner?: string;
    lastuser?: string;
    walkerid?: string;
    ready?: boolean;
    use?: WalkerUse;
    type?: string;
    description?: string;
  };
}
