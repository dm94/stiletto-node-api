import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';
import { ClanInfo, ClanInfoSchema } from '../../types/clans';

const routes: FastifyPluginAsync = async (server) => {
  server.get<{ Reply: ClanInfo[] }>(
    '/',
    {
      schema: {
        description: 'Return the list of clans',
        summary: 'getClans',
        operationId: 'getClans',
        tags: ['clans'],
        querystring: {
          type: 'object',
          required: [],
          properties: {
            pageSize: {
              type: 'integer',
              default: 10,
            },
            page: {
              type: 'integer',
              default: 1,
            },
            name: {
              type: 'string',
              description: 'Filter by Clan name',
            },
            region: {
              type: 'string',
              description: 'Filter by region',
            },
          },
        },
        response: {
          200: Type.Array(ClanInfoSchema),
        },
      },
    },
    async function () {
      return [
        {
          clanid: 'string',
          name: 'string',
          discordid: 'string',
          leaderid: 'string',
          invitelink: 'string',
          recruitment: false,
          flagcolor: 'string',
          symbol: 'string',
          region: 'string',
          discordTag: 'string',
        },
      ];
    },
  );
};

export default routes;
