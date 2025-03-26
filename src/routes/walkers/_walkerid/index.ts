import type { FastifyPluginAsync } from 'fastify';
import { Type } from '@sinclair/typebox';
import { WalkerUse } from '@customtypes/walkers';
import type { DeleteWalkersRequest, EditWalkersRequest } from '@customtypes/requests/walkers';
import { Permission } from '@customtypes/permissions';
import { addPermissions } from '@services/permission';
import {
  Error400Default,
  Error401Default,
  Error405Default,
  Error503Default,
} from '@customtypes/errors';

const routes: FastifyPluginAsync = async (server) => {
  server.put<EditWalkersRequest>(
    '/',
    {
      onRequest: [
        server.authenticate,
        (request, _reply, done) => addPermissions(server, request, done),
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
        body: {
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
      if (!request?.dbuser.clanid) {
        reply.code(405);
        return new Error('No clan');
      }

      const owner: string | undefined = request.body?.owner
        ? server.mysql.escape(request.body.owner)
        : undefined;
      const ready: boolean = request.body?.ready ?? false;
      const type: string | undefined = request.body?.type
        ? server.mysql.escape(request.body.type)
        : undefined;
      const use: WalkerUse | undefined = request.body?.use ?? undefined;
      const description: string | undefined = request.body?.description
        ? server.mysql.escape(request.body.description)
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
        request?.clanPermissions?.[Permission.WALKERS]
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
  server.delete<DeleteWalkersRequest>(
    '/',
    {
      onRequest: [
        server.authenticate,
        (request, _reply, done) => addPermissions(server, request, done),
      ],
      schema: {
        description: 'Delete the walker',
        summary: 'deleteWalker',
        operationId: 'deleteWalker',
        tags: ['walkers'],
        params: {
          type: 'object',
          properties: {
            walkerid: { type: 'string' },
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
      if (!request?.dbuser.clanid) {
        reply.code(405);
        return new Error('No clan');
      }

      if (
        request?.dbuser.discordid === request?.dbuser.leaderid ||
        request?.clanPermissions?.[Permission.WALKERS]
      ) {
        server.mysql.query(
          'delete from walkers where walkerID=? and discorid=?',
          [request.params.walkerid, request.dbuser.serverdiscord],
          (err, result) => {
            if (result) {
              return reply.code(204).send();
            }
            if (err) {
              return reply.code(503).send();
            }
          },
        );
      } else {
        return reply.code(401).send();
      }
    },
  );
};

export default routes;
