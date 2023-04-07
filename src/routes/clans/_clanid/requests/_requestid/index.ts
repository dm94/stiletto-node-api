import {
  Error400Default,
  Error401Default,
  Error405Default,
  Error503Default,
} from '@customtypes/errors';
import { RequestActions } from '@customtypes/member-request';
import { Permission } from '@customtypes/permissions';
import { UpdateClanRequest } from '@customtypes/requests/requests';
import { addPermissions } from '@services/permission';
import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

const routes: FastifyPluginAsync = async (server) => {
  server.put<UpdateClanRequest>(
    '/',
    {
      onRequest: [
        server.authenticate,
        (request, reply, done) => addPermissions(server, request, done),
      ],
      schema: {
        description: 'It serves to accept or reject an application for entry into a clan',
        summary: 'updateRequest',
        operationId: 'updateRequest',
        tags: ['clans'],
        params: {
          type: 'object',
          properties: {
            clanid: { type: 'integer' },
            requestid: { type: 'string' },
          },
        },
        querystring: {
          type: 'object',
          required: ['action'],
          properties: {
            action: {
              type: 'string',
              enum: Object.values(RequestActions),
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

      if (!request.params?.clanid || !request.params?.requestid || !request.query?.action) {
        return reply.code(400).send();
      }

      if (
        request?.dbuser.discordid !== request?.dbuser.leaderid &&
        (!request?.clanPermissions || !request.clanPermissions[Permission.REQUEST])
      ) {
        reply.code(401);
        return new Error('You do not have permissions to perform this action');
      }

      const clanId = Number(request.params.clanid);
      const action: string = request.query?.action;

      server.mysql.query(
        'select * from clanrequest where clanid=? and discordID=?',
        [clanId, request.params.requestid],
        (err, result) => {
          if (result && result[0]) {
            if (action === RequestActions.ACCEPT) {
              server.mysql.query(
                'update users set clanid=? where discordID=?',
                [clanId, request.params.requestid],
                (err) => {
                  if (err) {
                    return reply.code(503).send();
                  }
                },
              );
              server.mysql.query(
                'delete from clanrequest where discordID=?',
                [request.params.requestid],
                (err) => {
                  if (err) {
                    return reply.code(503).send();
                  }
                },
              );
              return reply.code(202).send({
                message: 'The request has been processed correctly',
              });
            } else if (action === RequestActions.REJECT) {
              server.mysql.query(
                'delete from clanrequest where clanid=? and discordID=?',
                [clanId, request.params.requestid],
                (err, result) => {
                  if (result) {
                    return reply.code(202).send({
                      message: 'The request has been processed correctly',
                    });
                  } else if (err) {
                    return reply.code(503).send();
                  }
                },
              );
            } else {
              return reply.code(405).send();
            }
          } else if (err) {
            return reply.code(503).send();
          } else {
            return reply.code(405).send();
          }
        },
      );
    },
  );
};

export default routes;
