import {
  Error400Default,
  Error401Default,
  Error404Default,
  Error405Default,
  Error503Default,
} from '@customtypes/errors';
import { type MemberRequest, MemberRequestSchema } from '@customtypes/member-request';
import type { GetClanRequest } from '@customtypes/requests/clans';
import type { RequestClanRequest } from '@customtypes/requests/requests';
import { Type } from '@sinclair/typebox';
import type { FastifyPluginAsync } from 'fastify';

const routes: FastifyPluginAsync = async (server) => {
  server.get<GetClanRequest, { Reply: MemberRequest[] }>(
    '/',
    {
      onRequest: [server.authenticate],
      schema: {
        description: 'Return the list of requests for entry to the clan',
        summary: 'getRequests',
        operationId: 'getRequests',
        tags: ['clans'],
        params: {
          type: 'object',
          properties: {
            clanid: { type: 'integer' },
          },
        },
        security: [
          {
            token: [],
          },
        ],
        response: {
          200: Type.Array(MemberRequestSchema),
          400: Error400Default,
          401: Error401Default,
          404: Error404Default,
          503: Error503Default,
        },
      },
    },
    (request, reply) => {
      if (!request?.dbuser) {
        reply.code(401);
        return new Error('Invalid token JWT');
      }

      if (Number(request.dbuser.clanid) !== Number(request.params.clanid)) {
        reply.code(401);
        return new Error('You are not a member of this clan');
      }

      if (!request.params?.clanid) {
        return reply.code(400).send();
      }

      const clanId = Number(request.params.clanid);
      server.mysql.query(
        'select users.discordid, users.nickname, users.discordtag, clans.leaderid, clanrequest.message from users,clanrequest, clans where users.discordid=clanrequest.discordid and clanrequest.clanid=clans.clanid and clanrequest.clanid=?',
        clanId,
        (err, result) => {
          if (result) {
            return reply.code(200).send(result as MemberRequest[]);
          }
          if (err) {
            return reply.code(503).send();
          }
          return reply.code(404).send();
        },
      );
    },
  );
  server.post<RequestClanRequest>(
    '/',
    {
      onRequest: [server.authenticate],
      schema: {
        description: 'Add a clan application, it can only be done if you are not in a clan',
        summary: 'sendRequest',
        operationId: 'sendRequest',
        tags: ['clans'],
        params: {
          type: 'object',
          properties: {
            clanid: { type: 'integer' },
          },
        },
        querystring: {
          type: 'object',
          required: [],
          properties: {
            message: {
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
          201: Type.Object({
            message: Type.String(),
          }),
          400: Error400Default,
          401: Error401Default,
          405: Error405Default,
          503: Error503Default,
        },
      },
    },
    (request, reply) => {
      if (!request?.dbuser) {
        reply.code(401);
        return new Error('Invalid token JWT');
      }

      if (request.dbuser.clanid) {
        reply.code(405);
        return new Error('You are already in a clan');
      }

      if (!request.params?.clanid) {
        return reply.code(400).send();
      }

      const message: string = request.query?.message ?? '';
      const clanId = Number(request.params.clanid);
      server.mysql.query(
        'insert into clanrequest(clanid,discordid,message) values(?,?,?)',
        [clanId, request.dbuser.discordid, message],
        (err, result) => {
          if (result) {
            return reply.code(201).send({
              message: 'Request sent',
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
