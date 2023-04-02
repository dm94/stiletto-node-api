import { FastifyPluginAsync } from 'fastify';
import { Type } from '@sinclair/typebox';
import { WalkerUse } from '@customtypes/walkers';
import { EditWalkersRequest } from '@customtypes/requests/walkers';
import { Permission } from '@customtypes/permissions';
import { addPermissions } from '@services/permission';

const routes: FastifyPluginAsync = async (server) => {
  server.put<EditWalkersRequest>(
    '/',
    {
      onRequest: [
        server.authenticate,
        (request, reply, done) => addPermissions(server, request, done),
      ],
      schema: {
        description:
          'You can edit the information of a walker, it is specially created to update the data of the discord log and assign an owner to a walker',
        summary: 'editWalker',
        operationId: 'editWalker',
        tags: ['walkers'],
        params: {
          type: 'object',
          properties: {
            walkerid: { type: 'string' },
          },
        },
        querystring: {
          type: 'object',
          required: [],
          properties: {
            owner: {
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
            token: [],
          },
        ],
        response: {
          202: Type.Object({
            message: Type.String(),
          }),
        },
      },
    },
    (request, reply) => {
      if (!request?.dbuser || !request?.dbuser.clanid) {
        reply.code(401);
        return new Error('Invalid token JWT');
      }

      const owner: string | undefined = request.query?.owner
        ? server.mysql.escape(request.query.owner)
        : undefined;
      const ready: boolean = request.query?.ready ?? false;
      const type: string | undefined = request.query?.type
        ? server.mysql.escape(request.query.type)
        : undefined;
      const use: WalkerUse | undefined = request.query?.use ?? undefined;
      const description: string | undefined = request.query?.description
        ? server.mysql.escape(request.query.description)
        : undefined;

      if (
        (description && description.length > 255) ||
        (type && type.length > 50) ||
        (owner && owner.length > 50)
      ) {
        return reply.code(400).send();
      }

      if (
        request?.dbuser.discordid === request?.dbuser.leaderid ||
        (request?.clanPermissions && request.clanPermissions[Permission.WALKERS])
      ) {
        server.mysql.query(
          'update walkers set ownerUser=?, walker_use=?, type=?, description=?, isReady=? where walkerID=?',
          [owner, use, type, description, ready, request.params.walkerid],
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
      } else {
        server.mysql.query(
          'update walkers set ownerUser=?, walker_use=?, type=?, description=?, isReady=? where walkerID=? and (ownerUser=? or lastUser=?)',
          [
            owner,
            use,
            type,
            description,
            ready,
            request.params.walkerid,
            request.dbuser.nickname,
            request.dbuser.nickname,
          ],
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
      }
    },
  );
};

export default routes;
