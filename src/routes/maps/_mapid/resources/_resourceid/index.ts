import { Error400Default, Error503Default } from '@customtypes/errors';
import type { DeleteResourceRequest, EditResourceRequest } from '@customtypes/requests/maps';
import { Type } from '@sinclair/typebox';
import type { FastifyPluginAsync } from 'fastify';

const routes: FastifyPluginAsync = async (server) => {
  server.put<EditResourceRequest>(
    '/',
    {
      schema: {
        description: 'For edit the resource',
        summary: 'editResource',
        operationId: 'editResource',
        tags: ['maps'],
        params: {
          type: 'object',
          properties: {
            mapid: { type: 'integer' },
            resourceid: { type: 'integer' },
          },
        },
        body: {
          type: 'object',
          required: ['token'],
          properties: {
            token: {
              type: 'string',
              description: 'Token generated',
            },
            description: {
              type: 'string',
              description: 'Resource description',
            },
            harvested: {
              type: 'string',
              description: 'Resource description',
            },
          },
        },
        response: {
          202: Type.Object({
            message: Type.String(),
          }),
          400: Error400Default,
          503: Error503Default,
        },
      },
    },
    (request, reply) => {
      if (!request.params.resourceid || !request.body.token) {
        return reply.code(400).send();
      }

      const description: string | undefined = request.body?.description ?? undefined;
      const harvested: string = request.body?.harvested ?? new Date().toISOString().split('T')[0];

      if (description) {
        server.mysql.query(
          'update resourcemap set description=? where mapid=? and resourceid=? and token=?',
          [description, request.params.mapid, request.params.resourceid, request.body.token],
          (err, result) => {
            if (result) {
              return reply.code(202).send({
                message: 'Edited resource',
              });
            }
            if (err) {
              return reply.code(503).send();
            }
          },
        );
      } else {
        server.mysql.query(
          'update resourcemap set lastharvested=? where mapid=? and resourceid=? and token=?',
          [harvested, request.params.mapid, request.params.resourceid, request.body.token],
          (err, result) => {
            if (result) {
              return reply.code(202).send({
                message: 'Edited resource',
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
  server.delete<DeleteResourceRequest>(
    '/',
    {
      schema: {
        description: 'Delete the resource',
        summary: 'deleteResource',
        operationId: 'deleteResource',
        tags: ['maps'],
        params: {
          type: 'object',
          properties: {
            mapid: { type: 'integer' },
            resourceid: { type: 'integer' },
          },
        },
        querystring: {
          type: 'object',
          required: ['token'],
          properties: {
            token: {
              type: 'string',
              description: 'Token generated',
            },
          },
        },
        response: {
          204: Type.Object({
            message: Type.String(),
          }),
          400: Error400Default,
          503: Error503Default,
        },
      },
    },
    (request, reply) => {
      if (!request.params.resourceid || !request.query.token) {
        return reply.code(400).send();
      }

      server.mysql.query(
        'delete from resourcemap where mapid=? and resourceid=? and token=?',
        [request.params.mapid, request.params.resourceid, request.query.token],
        (err, result) => {
          if (result) {
            return reply.code(204).send({
              message: 'Deleted resource',
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
