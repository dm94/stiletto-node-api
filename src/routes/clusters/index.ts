import { type ClusterInfo, ClusterSchema } from '@customtypes/clusters';
import { Error503Default } from '@customtypes/errors';
import { Type } from '@sinclair/typebox';
import type { FastifyPluginAsync } from 'fastify';

const routes: FastifyPluginAsync = async (server) => {
  server.get<{ Reply: ClusterInfo[] }>(
    '/',
    {
      schema: {
        description: 'Return the list of clusters',
        summary: 'getClusters',
        operationId: 'getClusters',
        tags: ['clusters'],
        response: {
          200: Type.Array(ClusterSchema),
          503: Error503Default,
        },
      },
    },
    (_request, reply) => {
      server.mysql.query(
        'select region, name, clan_limit, crossplay from clusters order by region, name, clan_limit',
        (err, result: ClusterInfo[]) => {
          if (result) {
            return reply.code(200).send(result);
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
