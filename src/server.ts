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
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

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
  methods: ['POST', 'GET', 'PUT', 'OPTIONS', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  origin: ['https://stiletto.deeme.dev', /\.deeme\.dev$/],
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

server.decorate('authenticate', async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch (_err) {
    reply.code(401);
    return new Error('Invalid token JWT');
  }
});

server.decorate('botAuth', (request, reply, done) => {
  if (!request?.headers?.apikey || request.headers.apikey !== server.config.API_KEY) {
    return reply.code(401).send(new Error('Invalid Api Key'));
  }
  done();
});

server.decorateRequest('clanPermissions', undefined);
server.decorateRequest('dbuser', undefined);
server.addHook('onRequest', (req, _reply, done) => {
  let bearer = req.headers.authorization;
  bearer = bearer?.replace('Bearer', '').trim();
  if (bearer) {
    server.mysql.query(
      'select users.nickname, users.discordtag, users.discordID discordid, users.clanid, clans.name clanname, clans.leaderid, clans.discordid serverdiscord from users left join clans on users.clanid=clans.clanid where users.token=?',
      bearer,
      (err, result) => {
        if (result?.[0]) {
          req.dbuser = {
            nickname: result[0].nickname ?? undefined,
            discordtag: result[0].discordtag,
            discordid: result[0].discordid,
            clanid: result[0].clanid ?? undefined,
            clanname: result[0].clanname ?? undefined,
            leaderid: result[0].leaderid ?? undefined,
            serverdiscord: result[0].serverdiscord ?? undefined,
          };
        }
        if (err) {
          console.log('err', err);
        }
        done();
      },
    );
  } else {
    done();
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
  (_request, reply) => {
    reply.code(404).send({ error: '404' });
  },
);

await server.register(config);

if (process.env.NODE_ENV === NodeEnv.development) {
  //@ts-ignore
  await server.register(swagger, schema);
  await server.register(swaggerUi, { routePrefix: '/doc' });
}

await server.register(autoLoad, {
  dir: join(__dirname, 'routes'),
  routeParams: true,
});

await server.ready();

if (process.env.NODE_ENV === NodeEnv.development) {
  server.swagger();
}

export default server;
