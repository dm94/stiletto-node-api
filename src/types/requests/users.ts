import type { RequestGenericInterface } from 'fastify';

export interface AddNickRequest extends RequestGenericInterface {
  Body: {
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
  Body: {
    code: string;
  };
}
