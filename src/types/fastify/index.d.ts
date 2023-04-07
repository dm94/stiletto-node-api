import {
  FastifyLoggerInstance,
  FastifyPluginAsync,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerBase,
  RawServerDefault,
} from 'fastify';
import { UserInfo } from '@customtypes/user';
import { Permissions } from '@customtypes/permissions';
import { MapInfo } from '@customtypes/maps';

declare module 'fastify' {
  export interface FastifyInstance<
    RawServer extends RawServerBase = RawServerDefault,
    RawRequest extends RawRequestDefaultExpression<RawServer> = RawRequestDefaultExpression<RawServer>,
    RawReply extends RawReplyDefaultExpression<RawServer> = RawReplyDefaultExpression<RawServer>,
    Logger = FastifyLoggerInstance,
  > {
    authenticate(): void;
    botAuth(): void;
  }
}

declare module 'fastify' {
  export interface FastifyRequest {
    dbuser: UserInfo;
    clanPermissions?: Permissions;
    mapInfo?: MapInfo;
  }
}
