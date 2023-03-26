import { RequestGenericInterface } from 'fastify';

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
