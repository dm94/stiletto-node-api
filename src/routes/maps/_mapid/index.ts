import {
  Error400Default,
  Error401Default,
  Error404Default,
  Error503Default,
} from '@customtypes/errors';
import { MapInfo, MapSchema } from '@customtypes/maps';
import { EditMapRequest, GetMapRequest } from '@customtypes/requests/maps';
import { addMapInfo } from '@services/mapinfo';
import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

const routes: FastifyPluginAsync = async (server) => {
  server.get<GetMapRequest, { Reply: MapInfo }>(
    '/',
    {
      onRequest: [(request, reply, done) => addMapInfo(server, request, done)],
      schema: {
        description: 'Returns map information',
        summary: 'getMap',
        operationId: 'getMap',
        tags: ['maps'],
        params: {
          type: 'object',
          properties: {
            mapid: { type: 'integer' },
          },
        },
        querystring: {
          type: 'object',
          required: ['mappass'],
          properties: {
            mappass: {
              type: 'string',
              description: 'Pass for the map',
            },
          },
        },
        response: {
          200: MapSchema,
          400: Error400Default,
          404: Error404Default,
          503: Error503Default,
        },
      },
    },
    (request, reply) => {
      if (!request.params.mapid || !request.query.mappass) {
        return reply.code(400).send();
      }

      if (request.mapInfo) {
        reply.code(200).send(request.mapInfo as MapInfo);
      } else {
        return reply.code(404).send();
      }
    },
  );
  server.put<EditMapRequest>(
    '/',
    {
      onRequest: [server.authenticate],
      schema: {
        description: 'Edit map data',
        summary: 'editMap',
        operationId: 'editMap',
        tags: ['maps'],
        params: {
          type: 'object',
          properties: {
            mapid: { type: 'integer' },
          },
        },
        querystring: {
          type: 'object',
          required: ['mappass', 'mapname'],
          properties: {
            mappass: {
              type: 'string',
              description: 'Password to view the map without login',
            },
            mapname: {
              type: 'string',
              description: 'Map name',
            },
            mapdate: {
              type: 'string',
              description: 'Date of the day the map was burned. aaaa-mm-dd',
            },
            allowediting: {
              type: 'boolean',
              description: 'Shows whether the map can be edited with the password or not',
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
          503: Error503Default,
        },
      },
    },
    (request, reply) => {
      if (!request?.dbuser) {
        reply.code(401);
        return new Error('Invalid token JWT');
      }

      const mapName: string = request.query?.mapname ?? 'Default Name';
      const mapDate: string = request.query?.mapdate ?? new Date().toISOString().split('T')[0];
      const mapPass: string = request.query?.mappass;
      const allowEditing: boolean = request.query?.allowediting ?? false;

      if (!mapPass) {
        return reply.code(400).send();
      }

      server.mysql.query(
        'update clanmaps set name=?, dateofburning=?, allowedit=?, pass=? where mapid=? and discordID=?',
        [mapName, mapDate, allowEditing, mapPass, request.params.mapid, request.dbuser.discordid],
        (err, result) => {
          if (result) {
            return reply.code(202).send({
              message: 'Map edited',
            });
          } else if (err) {
            return reply.code(503).send();
          }
        },
      );
    },
  );
  server.delete<GetMapRequest>(
    '/',
    {
      onRequest: [server.authenticate],
      schema: {
        description: 'Delete a map, only the owner of the map can do this.',
        summary: 'deleteMap',
        operationId: 'deleteMap',
        tags: ['maps'],
        params: {
          type: 'object',
          properties: {
            mapid: { type: 'integer' },
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

      server.mysql.query(
        'select * from clanmaps where mapid=? and discordID=?',
        [request.params.mapid, request.dbuser.discordid],
        (err, result) => {
          if (result && result[0]) {
            server.mysql.query(
              'delete from clanmaps where mapid=? and discordID=?',
              [request.params.mapid, request.dbuser.discordid],
              (err) => {
                if (err) {
                  return reply.code(503).send();
                }
              },
            );
            server.mysql.query(
              'delete from resourcemap where mapid=?',
              [request.params.mapid],
              (err) => {
                if (err) {
                  return reply.code(503).send();
                }
              },
            );
            return reply.code(204).send();
          } else if (err) {
            return reply.code(503).send();
          } else {
            return reply.code(404).send();
          }
        },
      );
    },
  );
};

export default routes;
