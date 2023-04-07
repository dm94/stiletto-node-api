import { WalkerType, WalkerUse } from '@customtypes/walkers';
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
    type?: WalkerType;
    description?: string;
  };
}

export interface EditWalkersRequest extends RequestGenericInterface {
  Params: {
    walkerid: string;
  };
  Querystring: {
    owner?: string;
    use?: WalkerUse;
    ready?: boolean;
    type?: string;
    description?: string;
  };
}

export interface DeleteWalkersRequest extends RequestGenericInterface {
  Params: {
    walkerid: string;
  };
}

export interface GetDiscordServersRequest extends RequestGenericInterface {
  Querystring: {
    code: string;
    redirect: string;
  };
}
