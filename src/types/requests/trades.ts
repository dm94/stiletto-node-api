import type { TradeType } from '@customtypes/trades';
import type { RequestGenericInterface } from 'fastify';

export interface CreateTradeRequest extends RequestGenericInterface {
  Body: {
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
