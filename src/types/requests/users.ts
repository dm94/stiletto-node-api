import { RequestGenericInterface } from 'fastify';

export interface addNickRequest extends RequestGenericInterface {
  Querystring: {
    dataupdate: string;
  };
}
