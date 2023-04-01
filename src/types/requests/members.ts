import { RequestGenericInterface } from 'fastify/types/request';

export interface GetMemberRequest extends RequestGenericInterface {
  Params: {
    clanid: number;
    memberid: string;
  };
  Querystring: {
    action: string;
  };
}
