import 'dotenv/config';
import fp from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';
import { type Static, Type } from '@sinclair/typebox';
import Ajv from 'ajv';

export enum NodeEnv {
  development = 'development',
  test = 'test',
  production = 'production',
}

export enum LogLevel {
  trace = 'trace',
  debug = 'debug',
  info = 'info',
  warn = 'warn',
  error = 'error',
  fatal = 'fatal',
}

const ConfigSchema = Type.Object({
  NODE_ENV: Type.Enum(NodeEnv),
  LOG_LEVEL: Type.Enum(LogLevel),
  API_HOST: Type.String(),
  API_PORT: Type.String(),
  JWT_SECRET: Type.String(),
  API_KEY: Type.String(),
  MYSQL_CONNECTION: Type.Optional(Type.String()),
  MONGODB_CONNECTION: Type.Optional(Type.String()),
  DISCORD_CLIENT_ID: Type.Optional(Type.String()),
  DISCORD_CLIENT_SECRET: Type.Optional(Type.String()),
  DISCORD_REDIRECT_URL: Type.Optional(Type.String()),
  DISCORD_WEBHOOK: Type.Optional(Type.String()),
});

const ajv = new Ajv({
  allErrors: true,
  removeAdditional: true,
  useDefaults: true,
  coerceTypes: true,
  allowUnionTypes: true,
});

export type Config = Static<typeof ConfigSchema>;

const configPlugin: FastifyPluginAsync = async (server) => {
  const validate = ajv.compile(ConfigSchema);
  const valid = validate(process.env);
  if (!valid) {
    throw new Error(`.env file validation failed - ${JSON.stringify(validate.errors, null, 2)}`);
  }
  server.decorate('config', process.env);
};

declare module 'fastify' {
  interface FastifyInstance {
    config: Config;
  }
}

export default fp(configPlugin);
