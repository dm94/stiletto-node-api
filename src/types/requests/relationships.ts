import { TypeRelationship } from '@customtypes/relationships';
import { RequestGenericInterface } from 'fastify/types/request';

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
