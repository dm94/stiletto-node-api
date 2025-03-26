import type { RequestGenericInterface } from 'fastify/types/request';

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
  };
  Body: {
    mappass: string;
    resourcetype: string;
    quality?: number;
    x: number;
    y: number;
    description?: string;
    harvested?: string;
  };
}

export interface EditResourceRequest extends RequestGenericInterface {
  Params: {
    mapid: number;
    resourceid: number;
  };
  Body: {
    token: string;
    description?: string;
    harvested?: string;
  };
}

export interface DeleteResourceRequest extends RequestGenericInterface {
  Params: {
    mapid: number;
    resourceid: number;
  };
  Querystring: {
    token: string;
  };
}
