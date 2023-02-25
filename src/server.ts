import fastify from 'fastify';
import config from './plugins/config.js';
import routes from './routes/index.js';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';

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

/*await server.register(require('@fastify/mysql'), {
  connectionString: 'mysql://root@localhost/mysql',
});*/

/*
server.register(require('@fastify/mongodb'), {
  forceClose: true,
  url: 'mongodb://mongo/mydb'
})
*/

server.register(jwt, {
  secret: 'supersecret',
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
await server.register(routes);
await server.ready();

export default server;
