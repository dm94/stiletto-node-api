import { RequestGenericInterface } from 'fastify/types/request';

export interface RequestClanRequest extends RequestGenericInterface {
  Querystring: {
    message?: string;
  };
  Params: {
    clanid: number;
  };
}
