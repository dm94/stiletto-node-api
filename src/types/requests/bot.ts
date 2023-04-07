import { Languages } from '@customtypes/discordconfig';
import { WalkerType, WalkerUse } from '@customtypes/walkers';
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
    type?: WalkerType;
    description?: string;
  };
}

export interface AddWalkerRequest extends RequestGenericInterface {
  Querystring: {
    walkerid: string;
    discordid: string;
    name: string;
    lastUser: string;
  };
}

export interface BotEditWalkerRequest extends RequestGenericInterface {
  Querystring: {
    walkerid: string;
    ready: boolean;
  };
  Params: {
    discordid: string;
  };
}

export interface LinkClanRequest extends RequestGenericInterface {
  Querystring: {
    memberid: string;
  };
  Params: {
    discordid: string;
  };
}

export interface KickFromClanRequest extends RequestGenericInterface {
  Querystring: {
    nick: string;
  };
  Params: {
    discordid: string;
  };
}
