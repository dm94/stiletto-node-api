import {
  type FastifyLoggerInstance,
  FastifyPluginAsync,
  type RawReplyDefaultExpression,
  type RawRequestDefaultExpression,
  type RawServerBase,
  type RawServerDefault,
} from 'fastify';
import type { UserInfo } from '@customtypes/user';
import type { Permissions } from '@customtypes/permissions';
import type { MapInfo } from '@customtypes/maps';

declare module 'fastify' {
  export interface FastifyInstance<
    RawServer extends RawServerBase = RawServerDefault,
    _RawRequest extends
      RawRequestDefaultExpression<RawServer> = RawRequestDefaultExpression<RawServer>,
    _RawReply extends RawReplyDefaultExpression<RawServer> = RawReplyDefaultExpression<RawServer>,
    _Logger = FastifyLoggerInstance,
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
