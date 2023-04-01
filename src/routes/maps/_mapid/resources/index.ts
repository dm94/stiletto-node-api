import { GetMapRequest } from '@customtypes/requests/maps';
import { ResourceInfo, ResourceSchema } from '@customtypes/resource';
import { addMapInfo } from '@services/mapinfo';
import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

const routes: FastifyPluginAsync = async (server) => {
  server.get<GetMapRequest, { Reply: ResourceInfo[] }>(
    '/',
    {
      onRequest: [server.authenticate, (request, reply, done) => addMapInfo(server, request, done)],
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
            } else if (err) {
              return reply.code(503).send();
            } else {
              return reply.code(404).send();
            }
          },
        );
      } else {
        server.mysql.query(
          'select resourcemap.resourceid, resourcemap.mapid, resourcemap.resourcetype, resourcemap.quality, resourcemap.x, resourcemap.y, resourcemap.description, resourcemap.lastharvested, clanmaps.typemap from clanmaps LEFT JOIN resourcemap on resourcemap.mapid=clanmaps.mapid where clanmaps.mapid=?',
          [request.params.mapid],
          (err, result) => {
            if (result) {
              return reply.code(200).send(result as ResourceInfo[]);
            } else if (err) {
              return reply.code(503).send();
            } else {
              return reply.code(404).send();
            }
          },
        );
      }
    },
  );
};

export default routes;
