import {
  Error400Default,
  Error401Default,
  Error405Default,
  Error503Default,
} from '@customtypes/errors';
import { MemberActions } from '@customtypes/members';
import { Permission } from '@customtypes/permissions';
import type { GetMemberRequest } from '@customtypes/requests/members';
import { addPermissions } from '@services/permission';
import { Type } from '@sinclair/typebox';
import type { FastifyPluginAsync } from 'fastify';

const routes: FastifyPluginAsync = async (server) => {
  server.put<GetMemberRequest>(
    '/',
    {
      onRequest: [
        server.authenticate,
        (request, _reply, done) => addPermissions(server, request, done),
      ],
      schema: {
        description:
          'To perform the actions of kick from the clan or changing the clan leader. Only leaders can use these options',
        summary: 'updateMember',
        operationId: 'updateMember',
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
          required: ['action'],
          properties: {
            action: {
              type: 'string',
              enum: Object.values(MemberActions),
            },
          },
        },
        security: [
          {
            token: [],
          },
        ],
        response: {
          202: Type.Object({
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
        return reply.code(401).send();
      }
      if (Number(request.dbuser.clanid) !== Number(request.params.clanid)) {
        return reply.code(401).send({
          message: 'You are not a member of this clan',
        });
      }

      const action: string = request.query?.action ?? undefined;

      if (
        !request.params?.clanid ||
        !request.params?.memberid ||
        (action !== MemberActions.KICK && action !== MemberActions.OWNER)
      ) {
        return reply.code(400).send();
      }

      if (
        action === MemberActions.OWNER &&
        request?.dbuser.discordid !== request?.dbuser.leaderid
      ) {
        return reply.code(401).send({
          message: 'You do not have permissions to perform this action',
        });
      }

      if (
        action === MemberActions.KICK &&
        request?.dbuser.discordid !== request?.dbuser.leaderid &&
        (!request?.clanPermissions || !request.clanPermissions[Permission.KICK_MEMBERS])
      ) {
        return reply.code(401).send({
          message: 'You do not have permissions to perform this action',
        });
      }

      const clanId = Number(request.params.clanid);
      const memberId = request.params.memberid;

      if (action === MemberActions.OWNER) {
        server.mysql.query(
          'update clans set leaderid=? where clanid=?',
          [memberId, clanId],
          (err, result) => {
            if (result) {
              return reply.code(202).send({
                message: 'The change has been made correctly',
              });
            }
            if (err) {
              return reply.code(503).send();
            }
          },
        );
      } else if (action === MemberActions.KICK) {
        if (
          memberId === request?.dbuser.leaderid ||
          request?.dbuser.discordid === request?.dbuser.leaderid
        ) {
          return reply.code(405).send();
        }

        server.mysql.query(
          'update users set clanid=null where discordID=? and clanid=?',
          [memberId, clanId],
          (err) => {
            if (err) {
              return reply.code(503).send();
            }
          },
        );
        server.mysql.query(
          'delete from clanpermissions where discordID=? and clanid=?',
          [memberId, clanId],
          (err) => {
            if (err) {
              return reply.code(503).send();
            }
          },
        );

        return reply.code(202).send({
          message: 'The change has been made correctly',
        });
      } else {
        return reply.code(405).send();
      }
    },
  );
};

export default routes;
