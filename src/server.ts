import fastify from 'fastify';
import config from './plugins/config.js';
import routes from './routes/index.js';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import mysql from '@fastify/mysql';

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
await server.register(rateLimit, {
  global: true,
  max: 100,
  timeWindow: '1 minute',
  allowList: ['127.0.0.1'],
});

/*await server.register(mysql, {
  connectionString: 'mysql://root@localhost/mysql',
});*/

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
await server.register(routes);
await server.ready();

export default server;
