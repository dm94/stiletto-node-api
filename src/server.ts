import fastify from 'fastify';
import config from './plugins/config.js';
import routes from './routes/index.js';
import cors from '@fastify/cors';

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
await server.register(config);
await server.register(routes);
await server.ready();

export default server;
