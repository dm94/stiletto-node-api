import type { MemberActions } from '@customtypes/members';
import type { RequestGenericInterface } from 'fastify/types/request';

export interface GetMemberRequest extends RequestGenericInterface {
  Params: {
    clanid: number;
    memberid: string;
  };
  Querystring: {
    action: MemberActions;
  };
}

export interface GetMemberPermissionsRequest extends RequestGenericInterface {
  Params: {
    clanid: number;
    memberid: string;
  };
}

export interface UpdateMemberPermissionsRequest extends RequestGenericInterface {
  Params: {
    clanid: number;
    memberid: string;
  };
  Querystring: {
    request: boolean;
    kickmembers: boolean;
    walkers: boolean;
    bot: boolean;
    diplomacy: boolean;
  };
}
