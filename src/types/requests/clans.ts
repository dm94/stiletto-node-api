import type { RequestGenericInterface } from 'fastify';

export interface GetClansRequest extends RequestGenericInterface {
  Querystring: {
    pageSize?: number;
    page?: number;
    name?: string;
    region?: string;
  };
}

export interface CreateClanRequest extends RequestGenericInterface {
  Querystring: {
    clanname: string;
    clancolor?: string;
    clandiscord?: string;
    recruit?: boolean;
    region?: string;
    symbol?: string;
  };
}

export interface UpdateClanRequest extends RequestGenericInterface {
  Querystring: {
    clanname?: string;
    clancolor?: string;
    clandiscord?: string;
    recruit?: boolean;
    region?: string;
    symbol?: string;
  };
  Params: {
    clanid: number;
  };
}

export interface DeleteClanRequest extends RequestGenericInterface {
  Params: {
    clanid: number;
  };
}

export interface GetClanRequest extends RequestGenericInterface {
  Params: {
    clanid: number;
  };
}

export interface GetDiscordConfigRequest extends RequestGenericInterface {
  Params: {
    clanid: number;
  };
}

export interface UpdateDiscordConfigRequest extends RequestGenericInterface {
  Querystring: {
    languaje?: string;
    clanlog?: boolean;
    kick?: boolean;
    readypvp?: boolean;
    walkeralarm?: boolean;
  };
  Params: {
    clanid: number;
  };
}

export interface SeeWhoHasLearntItRequest extends RequestGenericInterface {
  Querystring: {
    tech: string;
    tree: string;
  };
  Params: {
    clanid: number;
  };
}
