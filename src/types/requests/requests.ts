import { RequestGenericInterface } from 'fastify/types/request';

export interface RequestClanRequest extends RequestGenericInterface {
  Querystring: {
    message?: string;
  };
  Params: {
    clanid: number;
  };
}

export interface UpdateClanRequest extends RequestGenericInterface {
  Querystring: {
    action: string;
  };
  Params: {
    clanid: number;
    requestid: string;
  };
}
