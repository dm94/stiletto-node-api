import { RequestGenericInterface } from 'fastify';

export interface getClansRequest extends RequestGenericInterface {
  Querystring: {
    pageSize?: number;
    page?: number;
    name?: string;
    region?: string;
  };
}
