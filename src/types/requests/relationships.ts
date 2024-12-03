import type { TypeRelationship } from '@customtypes/relationships';
import type { RequestGenericInterface } from 'fastify/types/request';

export interface CreateRelationshipRequest extends RequestGenericInterface {
  Querystring: {
    typed: TypeRelationship;
    clanflag?: string;
    nameotherclan: string;
    symbol?: string;
  };
  Params: {
    clanid: number;
  };
}

export interface DeleteRelationshipRequest extends RequestGenericInterface {
  Params: {
    clanid: number;
    relationshipid: number;
  };
}
