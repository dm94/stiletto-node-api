import { RequestGenericInterface } from 'fastify';

export interface GetClansRequest extends RequestGenericInterface {
  Querystring: {
    pageSize?: number;
    page?: number;
    name?: string;
    region?: string;
  };
}
