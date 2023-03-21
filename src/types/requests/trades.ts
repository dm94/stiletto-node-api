import { RequestGenericInterface } from 'fastify';

export interface createTradeRequest extends RequestGenericInterface {
  Querystring: {
    type: string;
    resource: string;
    amount?: number;
    quality?: number;
    region: string;
    price: number;
  };
}

export interface getTradesRequest extends RequestGenericInterface {
  Querystring: {
    pageSize?: number;
    page?: number;
    type?: string;
    resource?: string;
    region?: string;
  };
}
