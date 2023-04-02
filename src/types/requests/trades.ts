import { TradeType } from '@customtypes/trades';
import { RequestGenericInterface } from 'fastify';

export interface CreateTradeRequest extends RequestGenericInterface {
  Querystring: {
    type: TradeType;
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
    type?: TradeType;
    resource?: string;
    region?: string;
  };
}

export interface DeleteTradeRequest extends RequestGenericInterface {
  Params: {
    tradeId: number;
  };
}
