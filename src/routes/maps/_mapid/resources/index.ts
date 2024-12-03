import {
  Error400Default,
  Error401Default,
  Error404Default,
  Error405Default,
  Error503Default,
} from '@customtypes/errors';
import type { AddResourceRequest, GetMapRequest } from '@customtypes/requests/maps';
import { type ResourceInfo, ResourceSchema } from '@customtypes/resource';
import { addMapInfo } from '@services/mapinfo';
import { Type } from '@sinclair/typebox';
import type { FastifyPluginAsync } from 'fastify';

const routes: FastifyPluginAsync = async (server) => {
  server.get<GetMapRequest, { Reply: ResourceInfo[] }>(
    '/',
    {
      onRequest: [(request, _reply, done) => addMapInfo(server, request, done)],
      schema: {
        description: 'Return all resources for that map',
        summary: 'getResources',
        operationId: 'getResources',
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
          200: Type.Array(ResourceSchema),
          400: Error400Default,
          401: Error401Default,
          404: Error404Default,
          503: Error503Default,
        },
      },
    },
    (request, reply) => {
      if (!request.params.mapid || !request.query.mappass) {
        return reply.code(400).send();
      }
      if (!request.mapInfo) {
        return reply.code(401).send();
      }

      if (
        request.mapInfo.allowedit ||
        (request.dbuser && request.dbuser.discordid === request.mapInfo.discordid)
      ) {
        server.mysql.query(
          'select resourcemap.resourceid, resourcemap.mapid, resourcemap.resourcetype, resourcemap.quality, resourcemap.x, resourcemap.y, resourcemap.token, resourcemap.description, resourcemap.lastharvested, clanmaps.typemap from clanmaps LEFT JOIN resourcemap on resourcemap.mapid=clanmaps.mapid where clanmaps.mapid=?',
          [request.params.mapid],
          (err, result) => {
            if (result) {
              return reply.code(200).send(result as ResourceInfo[]);
            }
            if (err) {
              return reply.code(503).send();
            }
            return reply.code(404).send();
          },
        );
      } else {
        server.mysql.query(
          'select resourcemap.resourceid, resourcemap.mapid, resourcemap.resourcetype, resourcemap.quality, resourcemap.x, resourcemap.y, resourcemap.description, resourcemap.lastharvested, clanmaps.typemap from clanmaps LEFT JOIN resourcemap on resourcemap.mapid=clanmaps.mapid where clanmaps.mapid=?',
          [request.params.mapid],
          (err, result) => {
            if (result) {
              return reply.code(200).send(result as ResourceInfo[]);
            }
            if (err) {
              return reply.code(503).send();
            }
            return reply.code(404).send();
          },
        );
      }
    },
  );
  server.post<AddResourceRequest>(
    '/',
    {
      onRequest: [(request, _reply, done) => addMapInfo(server, request, done)],
      schema: {
        description: 'To create a new resource in the map',
        summary: 'addResourceMap',
        operationId: 'addResourceMap',
        tags: ['maps'],
        params: {
          type: 'object',
          properties: {
            mapid: { type: 'integer' },
          },
        },
        querystring: {
          type: 'object',
          required: ['mappass', 'resourcetype', 'x', 'y'],
          properties: {
            mappass: {
              type: 'string',
              description: 'Pass for the map',
            },
            resourcetype: {
              type: 'string',
              description: 'Type of resource',
            },
            quality: {
              type: 'integer',
              description: 'Resource quality',
            },
            x: {
              type: 'number',
              description: 'Resource Coordinate X',
            },
            y: {
              type: 'number',
              description: 'Resource Coordinate Y',
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
      if (!request.params.mapid || !request.query.mappass) {
        return reply.code(400).send();
      }
      if (!request.mapInfo) {
        return reply.code(401).send();
      }

      if (
        !request.mapInfo.allowedit &&
        !(request.dbuser && request.mapInfo.discordid === request.dbuser.discordid)
      ) {
        return reply.code(405).send();
      }

      const resourceType: string = request.query?.resourcetype ?? 'Aloe';
      const x: number = request.query?.x;
      const y: number = request.query?.y;
      let quality: number = request.query?.quality ?? 0;
      const description: string = request.query?.description ?? '';
      const harvested: string =
        request.query?.harvested && request.query?.harvested.length > 1
          ? request.query?.harvested
          : new Date().toISOString().split('T')[0];

      if (quality > 100) {
        quality = 100;
      }

      const randomToken = Math.random().toString(36).slice(-8);

      server.mysql.query(
        'insert into resourcemap(mapid,resourcetype,quality,x,y,token, description, lastharvested) values(?,?,?,?,?,?,?,?)',
        [request.params.mapid, resourceType, quality, x, y, randomToken, description, harvested],
        (err, result) => {
          if (result) {
            return reply.code(201).send({
              message: 'Added resource',
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
