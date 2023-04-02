import { WalkerUse } from '@customtypes/walkers';
import { RequestGenericInterface } from 'fastify/types/request';

export interface GetWalkersRequest extends RequestGenericInterface {
  Querystring: {
    pageSize?: number;
    page?: number;
    name?: string;
    owner?: string;
    lastuser?: string;
    walkerid?: string;
    ready?: boolean;
    use?: WalkerUse;
    type?: string;
  };
}
