import { Error400Default, Error401Default, Error503Default } from '@customtypes/errors';
import { Permission } from '@customtypes/permissions';
import { DeleteRelationshipRequest } from '@customtypes/requests/relationships';
import { addPermissions } from '@services/permission';
import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

const routes: FastifyPluginAsync = async (server) => {
  server.delete<DeleteRelationshipRequest>(
    '/',
    {
      onRequest: [
        server.authenticate,
        (request, reply, done) => addPermissions(server, request, done),
      ],
      schema: {
        description:
          'It erases a diplomatic relationship. In case of war the other clan has to accept it.',
        summary: 'deleteRelationship',
        operationId: 'deleteRelationship',
        tags: ['clans'],
        params: {
          type: 'object',
          properties: {
            clanid: { type: 'integer' },
            relationshipid: { type: 'integer' },
          },
        },
        security: [
          {
            token: [],
          },
        ],
        response: {
          204: Type.Object({
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

      if (!request.params?.clanid) {
        return reply.code(400).send();
      }

      if (
        request?.dbuser.discordid !== request?.dbuser.leaderid &&
        (!request?.clanPermissions || !request.clanPermissions[Permission.DIPLOMACY])
      ) {
        reply.code(401);
        return new Error('You do not have permissions to perform this action');
      }

      const clanId = Number(request.params.clanid);
      const relationshipId = Number(request.params.relationshipid);

      server.mysql.query(
        'delete from diplomacy where idcreatorclan=? and id=?',
        [clanId, relationshipId],
        (err, result) => {
          if (result) {
            return reply.code(204).send();
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
