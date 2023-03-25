import {
  FastifyLoggerInstance,
  FastifyPluginAsync,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerBase,
  RawServerDefault,
} from 'fastify';
import { UserInfo } from '@customtypes/user';

declare module 'fastify' {
  export interface FastifyInstance<
    RawServer extends RawServerBase = RawServerDefault,
    RawRequest extends RawRequestDefaultExpression<RawServer> = RawRequestDefaultExpression<RawServer>,
    RawReply extends RawReplyDefaultExpression<RawServer> = RawReplyDefaultExpression<RawServer>,
    Logger = FastifyLoggerInstance,
  > {
    authenticate(): void;
  }
}

declare module 'fastify' {
  export interface FastifyRequest {
    dbuser: UserInfo;
  }
}
