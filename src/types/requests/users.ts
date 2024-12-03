import type { RequestGenericInterface } from 'fastify';

export interface AddNickRequest extends RequestGenericInterface {
  Querystring: {
    dataupdate: string;
  };
}

export interface GetTechRequest extends RequestGenericInterface {
  Params: {
    discordid: string;
  };
  Querystring: {
    tree: string;
  };
}

export interface AuthRequest extends RequestGenericInterface {
  Querystring: {
    code: string;
  };
}
