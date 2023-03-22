import { RequestGenericInterface } from 'fastify';

export interface CreateTradeRequest extends RequestGenericInterface {
  Querystring: {
    type: string;
    resource: string;
    amount?: number;
    quality?: number;
    region: string;
    price: number;
  };
}

export interface GetTradesRequest extends RequestGenericInterface {
  Querystring: {
    pageSize?: number;
    page?: number;
    type?: string;
    resource?: string;
    region?: string;
  };
}

export interface DeleteTradeRequest extends RequestGenericInterface {
  Params: {
    tradeId: number;
  };
}
