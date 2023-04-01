import { RequestGenericInterface } from 'fastify/types/request';

export interface AddMapRequest extends RequestGenericInterface {
  Querystring: {
    mapname: string;
    mapdate: string;
    maptype: string;
  };
}
