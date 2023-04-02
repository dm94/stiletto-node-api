import { RequestGenericInterface } from 'fastify/types/request';

export interface AddMapRequest extends RequestGenericInterface {
  Querystring: {
    mapname: string;
    mapdate: string;
    maptype: string;
  };
}

export interface GetMapRequest extends RequestGenericInterface {
  Params: {
    mapid: number;
  };
  Querystring: {
    mappass: string;
  };
}

export interface EditMapRequest extends RequestGenericInterface {
  Params: {
    mapid: number;
  };
  Querystring: {
    mappass: string;
    mapname: string;
    mapdate: string;
    allowediting: boolean;
  };
}

export interface AddResourceRequest extends RequestGenericInterface {
  Params: {
    mapid: number;
  };
  Querystring: {
    mappass: string;
    resourcetype: string;
    quality?: number;
    x: number;
    y: number;
    description?: string;
    harvested?: string;
  };
}
