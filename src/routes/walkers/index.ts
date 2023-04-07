import { FastifyPluginAsync } from 'fastify';
import { Type } from '@sinclair/typebox';
import { WalkerInfo, WalkerSchema, WalkerType, WalkerUse } from '@customtypes/walkers';
import { GetWalkersRequest } from '@customtypes/requests/walkers';
import { Error401Default, Error503Default } from '@customtypes/errors';

const routes: FastifyPluginAsync = async (server) => {
  server.get<GetWalkersRequest, { Reply: WalkerInfo[] }>(
    '/',
    {
      onRequest: [server.authenticate],
      schema: {
        description: 'Return walkers from a discord server',
        summary: 'getWalkers',
        operationId: 'getWalkers',
        tags: ['walkers'],
        querystring: {
          type: 'object',
          required: [],
          properties: {
            pageSize: {
              type: 'integer',
              default: 10,
              minimum: 1,
              maximum: 100,
            },
            page: {
              type: 'integer',
              default: 1,
              minimum: 1,
            },
            name: {
              type: 'string',
            },
            owner: {
              type: 'string',
            },
            lastuser: {
              type: 'string',
            },
            walkerid: {
              type: 'string',
            },
            ready: {
              type: 'boolean',
            },
            use: {
              type: 'string',
              enum: Object.values(WalkerUse),
            },
            type: {
              type: 'string',
              description: 'Walker Type: Dinghy, Falco...',
              enum: Object.values(WalkerType),
            },
            description: {
              type: 'string',
            },
          },
        },
        security: [
          {
            token: [],
          },
        ],
        response: {
          200: Type.Array(WalkerSchema),
          401: Error401Default,
          503: Error503Default,
        },
      },
    },
    (request, reply) => {
      if (!request?.dbuser) {
        reply.code(401);
        return new Error('Invalid token JWT');
      }
      if (!request?.dbuser.clanid) {
        reply.code(405);
        return new Error('No clan');
      }

      let pageSize: number =
        request.query?.pageSize && request.query?.pageSize > 0 ? request.query.pageSize : 10;
      let page: number = request.query?.page && request.query.page > 0 ? request.query.page : 1;

      const name: string | undefined = request.query?.name ? `%${request.query.name}%` : undefined;
      const owner: string | undefined = request.query?.owner ? request.query.owner : undefined;
      const lastuser: string | undefined = request.query?.lastuser
        ? request.query.lastuser
        : undefined;
      const walkerid: string | undefined = request.query?.walkerid
        ? request.query.walkerid
        : undefined;
      const ready: boolean | undefined = request.query?.ready ?? undefined;
      const type: WalkerType | undefined = request.query?.type ? request.query.type : undefined;
      const use: WalkerUse | undefined = request.query?.use ?? undefined;
      const description: string | undefined = request.query?.description
        ? `%${request.query.description}%`
        : undefined;

      if (pageSize < 1) {
        pageSize = 1;
      }
      if (page < 1) {
        page = 1;
      }

      const offset = pageSize * (page - 1);
      const queryValues: unknown[] = [];

      let sql =
        'SELECT walkers.walkerID as walkerid, walkers.name, walkers.ownerUser, walkers.lastUser as lastuser, walkers.datelastuse, walkers.type, walkers.walker_use, walkers.isReady, walkers.description from walkers, clans where clans.discordid=walkers.discorid and clans.clanid=?';
      queryValues.push(request.dbuser.clanid);

      if (name) {
        sql += ' and walkers.name like ?';
        queryValues.push(name);
      }
      if (owner) {
        sql += ' and walkers.ownerUser like ?';
        queryValues.push(owner);
      }
      if (lastuser) {
        sql += ' and walkers.lastUser like ?';
        queryValues.push(lastuser);
      }
      if (walkerid) {
        sql += ' and walkers.walkerID=?';
        queryValues.push(walkerid);
      }
      if (ready !== undefined) {
        sql += ' and walkers.isReady=?';
        queryValues.push(ready);
      }
      if (use) {
        sql += ' and walkers.walker_use=?';
        queryValues.push(use);
      }
      if (description) {
        sql += ' and walkers.description like ?';
        queryValues.push(description);
      }
      if (type) {
        sql += ' and walkers.type=?';
        queryValues.push(type);
      }

      sql += ` ORDER BY walkers.datelastuse DESC LIMIT ${pageSize} OFFSET ${offset}`;

      server.mysql.query(sql, queryValues, (err, result) => {
        if (result) {
          return reply.code(200).send(result as WalkerInfo[]);
        }
        if (err) {
          return reply.code(503).send();
        }
      });
    },
  );
};

export default routes;
