import fastify from 'fastify';
import config, { NodeEnv } from './plugins/config.js';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import autoLoad from '@fastify/autoload';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import mysql from '@fastify/mysql';
import mongodb from '@fastify/mongodb';
import { schema } from './utils/swagger';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = fastify({
  ajv: {
    customOptions: {
      removeAdditional: 'all',
      coerceTypes: true,
      useDefaults: true,
    },
  },
  logger: {
    level: process.env.LOG_LEVEL,
  },
});

await server.register(cors, {
  // put your options here
});

if (process.env.MYSQL_CONNECTION) {
  await server.register(mysql, {
    connectionString: process.env.MYSQL_CONNECTION,
  });
}

if (process.env.MONGODB_CONNECTION) {
  await server.register(mongodb, {
    forceClose: true,
    url: process.env.MONGODB_CONNECTION,
  });
}

await server.register(jwt, {
  secret: process.env.JWT_SECRET ?? 'supersecret',
});

server.decorate('authenticate', async function (request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

await server.register(rateLimit, {
  global: true,
  max: 100,
  timeWindow: '1 minute',
  allowList: ['127.0.0.1'],
});

/* 404 error handling */
server.setNotFoundHandler(
  {
    preHandler: server.rateLimit({
      max: 4,
      timeWindow: 500,
    }),
  },
  function (request, reply) {
    reply.code(404).send({ error: '404' });
  },
);

await server.register(config);

if (process.env.NODE_ENV === NodeEnv.development) {
  await server.register(swagger, schema);
  await server.register(swaggerUi, { routePrefix: '/doc' });
}

await server.register(autoLoad, {
  dir: join(__dirname, 'routes'),
});

await server.ready();

if (process.env.NODE_ENV === NodeEnv.development) {
  server.swagger();
}

export default server;
