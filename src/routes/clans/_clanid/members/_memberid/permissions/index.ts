import {
  Error400Default,
  Error401Default,
  Error404Default,
  Error503Default,
} from '@customtypes/errors';
import { type Permissions, PermissionsSchema } from '@customtypes/permissions';
import type {
  GetMemberPermissionsRequest,
  UpdateMemberPermissionsRequest,
} from '@customtypes/requests/members';
import { Type } from '@sinclair/typebox';
import type { FastifyPluginAsync } from 'fastify';

const routes: FastifyPluginAsync = async (server) => {
  server.get<GetMemberPermissionsRequest, { Reply: Permissions }>(
    '/',
    {
      onRequest: [server.authenticate],
      schema: {
        description:
          'Return a clan member&#39;s permissions Only the clan leader and the clan member can use this endpoint.',
        summary: 'getMemberPermissions',
        operationId: 'getMemberPermissions',
        tags: ['clans'],
        params: {
          type: 'object',
          properties: {
            clanid: { type: 'integer' },
            memberid: { type: 'string' },
          },
        },
        security: [
          {
            token: [],
          },
        ],
        response: {
          200: PermissionsSchema,
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

      if (!request.params?.clanid || !request.params?.memberid) {
        return reply.code(400).send();
      }

      const memberId = request.params.memberid;

      if (
        request?.dbuser.discordid !== request?.dbuser.leaderid &&
        request?.dbuser.discordid !== memberId
      ) {
        reply.code(401);
        return new Error('You do not have permissions to perform this action');
      }

      server.mysql.query(
        'select clanid, discordID, request, kickmembers, walkers, bot, diplomacy from clanpermissions where clanid=? and discordID=?',
        [request.dbuser.clanid, memberId],
        (err, result) => {
          if (result?.[0]) {
            return reply.code(200).send({
              clanid: result[0].clanid,
              discordid: result[0].discordID,
              request: Boolean(result[0].request),
              kickmembers: Boolean(result[0].kickmembers),
              walkers: Boolean(result[0].walkers),
              bot: Boolean(result[0].bot),
              diplomacy: Boolean(result[0].diplomacy),
            });
          }

          if (err) {
            return reply.code(503).send();
          }

          return reply.code(404).send();
        },
      );
    },
  );
  server.put<UpdateMemberPermissionsRequest>(
    '/',
    {
      onRequest: [server.authenticate],
      schema: {
        description: 'Only the leader can perform this action',
        summary: 'updateMemberPermissions',
        operationId: 'updateMemberPermissions',
        tags: ['clans'],
        params: {
          type: 'object',
          properties: {
            clanid: { type: 'integer' },
            memberid: { type: 'string' },
          },
        },
        querystring: {
          type: 'object',
          required: ['request', 'kickmembers', 'walkers', 'bot', 'diplomacy'],
          properties: {
            request: {
              type: 'boolean',
            },
            kickmembers: {
              type: 'boolean',
            },
            walkers: {
              type: 'boolean',
            },
            bot: {
              type: 'boolean',
            },
            diplomacy: {
              type: 'boolean',
            },
          },
        },
        security: [
          {
            token: [],
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
      if (!request?.dbuser) {
        reply.code(401);
        return new Error('Invalid token JWT');
      }
      if (Number(request.dbuser.clanid) !== Number(request.params.clanid)) {
        reply.code(401);
        return new Error('You are not a member of this clan');
      }

      if (request?.dbuser.discordid !== request?.dbuser.leaderid) {
        reply.code(401);
        return new Error('You do not have permissions to perform this action');
      }

      if (!request.params?.clanid || !request.params?.memberid) {
        return reply.code(400).send();
      }

      const requests: boolean = request.query?.request ?? false;
      const kickmembers: boolean = request.query?.kickmembers ?? false;
      const walkers: boolean = request.query?.walkers ?? false;
      const bot: boolean = request.query?.bot ?? false;
      const diplomacy: boolean = request.query?.diplomacy ?? false;

      const memberId = request.params.memberid;

      server.mysql.query(
        'insert into clanpermissions(clanid,discordID,request,kickmembers,walkers,bot,diplomacy) values(?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE request=?, kickmembers=?, walkers=?, bot=?, diplomacy=?',
        [
          request.dbuser.clanid,
          memberId,
          requests,
          kickmembers,
          walkers,
          bot,
          diplomacy,
          requests,
          kickmembers,
          walkers,
          bot,
          diplomacy,
        ],
        (err, result) => {
          if (result) {
            return reply.code(200).send({
              message: 'The change has been made correctly',
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
