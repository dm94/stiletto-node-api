import { GetWalkersByServerRequest } from '@customtypes/requests/bot';
import { WalkerInfo, WalkerSchema, WalkerUse } from '@customtypes/walkers';
import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

const routes: FastifyPluginAsync = async (server) => {
  server.get<GetWalkersByServerRequest, { Reply: WalkerInfo[] }>(
    '/',
    {
      onRequest: [server.botAuth],
      schema: {
        description: 'Get Walkers by server',
        summary: 'getWalkersByServer',
        operationId: 'getWalkersByServer',
        tags: ['bot', 'walkers'],
        querystring: {
          type: 'object',
          required: ['discordid'],
          properties: {
            discordid: {
              type: 'string',
            },
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
            },
            description: {
              type: 'string',
            },
          },
        },
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: Type.Array(WalkerSchema),
        },
      },
    },
    (request, reply) => {
      if (!request?.query?.discordid) {
        return reply.code(400).send();
      }

      let pageSize: number =
        request.query?.pageSize && request.query?.pageSize > 0 ? request.query.pageSize : 10;
      let page: number = request.query?.page && request.query.page > 0 ? request.query.page : 1;

      const name: string | undefined = request.query?.name
        ? server.mysql.escape(request.query.name)
        : undefined;
      const owner: string | undefined = request.query?.owner
        ? server.mysql.escape(request.query.owner)
        : undefined;
      const lastuser: string | undefined = request.query?.lastuser
        ? server.mysql.escape(request.query.lastuser)
        : undefined;
      const walkerid: string | undefined = request.query?.walkerid
        ? server.mysql.escape(request.query.walkerid)
        : undefined;
      const ready: boolean | undefined = request.query?.ready ?? undefined;
      const type: string | undefined = request.query?.type
        ? server.mysql.escape(request.query.type)
        : undefined;
      const use: WalkerUse | undefined = request.query?.use ?? undefined;
      const description: string | undefined = request.query?.description
        ? server.mysql.escape(request.query.description)
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
        'SELECT walkerID, walkers.name, walkers.ownerUser, walkers.lastUser, walkers.datelastuse, walkers.type, walkers.walker_use, walkers.isReady, walkers.description FROM walkers WHERE discorid=?';
      queryValues.push(request.query.discordid);

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
