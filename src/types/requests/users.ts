import { RequestGenericInterface } from 'fastify';

export interface AddNickRequest extends RequestGenericInterface {
  Querystring: {
    dataupdate: string;
  };
}
