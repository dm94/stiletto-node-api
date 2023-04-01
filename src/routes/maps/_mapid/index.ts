import { MapInfo, MapSchema } from '@customtypes/maps';
import { GetMapRequest } from '@customtypes/requests/maps';
import { FastifyPluginAsync } from 'fastify';

const routes: FastifyPluginAsync = async (server) => {
  server.get<GetMapRequest, { Reply: MapInfo }>(
    '/',
    {
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
        },
      },
    },
    (request, reply) => {
      if (!request.params.mapid || !request.query.mappass) {
        return reply.code(400).send();
      }

      server.mysql.query(
        'select mapid, typemap, discordID as discordid, name, dateofburning, pass, allowedit from clanmaps where mapid=? and pass=?',
        [request.params.mapid, request.query.mappass],
        (err, result) => {
          if (result && result[0]) {
            return reply.code(200).send(result[0] as MapInfo);
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
