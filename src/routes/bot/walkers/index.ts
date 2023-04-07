import { Error400Default, Error401Default, Error503Default } from '@customtypes/errors';
import {
  AddWalkerRequest,
  BotEditWalkerRequest,
  GetWalkersByServerRequest,
} from '@customtypes/requests/bot';
import { WalkerInfo, WalkerSchema, WalkerUse, WalkerType } from '@customtypes/walkers';
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
              enum: Object.values(WalkerType),
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
          400: Error400Default,
          401: Error401Default,
          503: Error503Default,
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
        'SELECT walkerID as walkerid, discorid as discordid, name, ownerUser, lastUser as lastuser, datelastuse, type, walker_use as "use", isReady, description FROM walkers WHERE discorid=?';
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
        console.log('result', result);
        if (result) {
          return reply.code(200).send(result as WalkerInfo[]);
        } else if (err) {
          console.log('err', err);
          return reply.code(503).send();
        }
      });
    },
  );
  server.post<AddWalkerRequest>(
    '/',
    {
      onRequest: [server.botAuth],
      schema: {
        description: 'Add or update a walker',
        summary: 'addWalker',
        operationId: 'addWalker',
        tags: ['bot', 'walkers'],
        querystring: {
          type: 'object',
          required: ['walkerid', 'discordid', 'name', 'lastUser'],
          properties: {
            walkerid: {
              type: 'string',
            },
            discordid: {
              type: 'string',
            },
            name: {
              type: 'string',
            },
            lastUser: {
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
          201: Type.Object({
            message: Type.String(),
          }),
          400: Error400Default,
          401: Error401Default,
          503: Error503Default,
        },
      },
    },
    (request, reply) => {
      if (
        !request?.query?.discordid ||
        !request?.query?.walkerid ||
        !request?.query?.name ||
        !request?.query?.lastUser
      ) {
        return reply.code(400).send();
      }

      const walkerid: string = request.query.walkerid;
      const discordid: string = request.query.discordid;
      const name: string = request.query.name;
      const lastuser: string = request.query.lastUser;

      const date = new Date().toISOString().split('T')[0];

      server.mysql.query(
        'select * from walkers where name=? and discorid=?',
        [name, discordid],
        (err, result) => {
          if (result && result[0]) {
            server.mysql.query(
              'update walkers set datelastuse=?, lastUser=?, walkerID=? where name=? and discorid=?',
              [date, lastuser, walkerid, name, discordid],
              (err, result) => {
                if (result) {
                  return reply.code(201).send({
                    message: 'Walker created',
                  });
                }
                if (err) {
                  return reply.code(503).send();
                }
              },
            );
          } else if (err) {
            return reply.code(503).send();
          } else {
            let walkerUse: WalkerUse | undefined = undefined;
            let walkerType: WalkerType | undefined = undefined;

            const nameLowerCase = name.toLowerCase();

            Object.keys(WalkerUse)
              .map((key) => WalkerUse[key])
              .forEach((key) => {
                if (nameLowerCase.includes(key.toLowerCase())) {
                  walkerUse = key;
                }
              });

            if (nameLowerCase.includes('spider')) {
              walkerType = WalkerType.NOMAD_SPIDER;
            } else if (nameLowerCase.includes('raptor')) {
              walkerType = WalkerType.RAPTOR_SKY;
            } else {
              Object.keys(WalkerType)
                .map((key) => WalkerType[key])
                .forEach((key) => {
                  if (nameLowerCase.includes(key.toLowerCase())) {
                    walkerType = key;
                  }
                });
            }

            server.mysql.query(
              'insert into walkers(walkerID,discorid,name,lastUser,datelastuse, walker_use, type, isReady) values(?,?,?,?,?,?,?,0) ON DUPLICATE KEY UPDATE name=?, datelastuse=?, lastUser=?, discorid=?',
              [
                walkerid,
                discordid,
                name,
                lastuser,
                date,
                walkerUse,
                walkerType,
                name,
                date,
                lastuser,
                discordid,
              ],
              (err, result) => {
                if (result) {
                  return reply.code(201).send({
                    message: 'Walker created',
                  });
                }
                if (err) {
                  return reply.code(503).send();
                }
              },
            );
          }
        },
      );
    },
  );
  server.put<BotEditWalkerRequest>(
    '/:discordid',
    {
      onRequest: [server.botAuth],
      schema: {
        description: 'If is PVP walker, it is marked as not ready',
        summary: 'botEditWalker',
        operationId: 'botEditWalker',
        tags: ['bot', 'walkers'],
        params: {
          type: 'object',
          properties: {
            discordid: { type: 'string' },
          },
        },
        querystring: {
          type: 'object',
          required: ['walkerid', 'ready'],
          properties: {
            walkerid: {
              type: 'string',
            },
            ready: {
              type: 'boolean',
            },
          },
        },
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: Type.Object({
            message: Type.String(),
          }),
          400: Error400Default,
          401: Error401Default,
          503: Error503Default,
        },
      },
    },
    (request, reply) => {
      if (!request?.params?.discordid || !request?.query?.walkerid) {
        return reply.code(400).send();
      }

      const walkerid: string = request.query.walkerid;
      const discordid: string = request.params.discordid;
      const ready: boolean | undefined = request.query?.ready ?? undefined;

      server.mysql.query(
        'update walkers set isReady=? where discorid=? and walkerID=?',
        [ready, discordid, walkerid],
        (err, result) => {
          if (result) {
            return reply.code(200).send({
              message: 'Walker updated',
            });
          }
          if (err) {
            return reply.code(503).send();
          }
        },
      );
    },
  );
};

export default routes;
