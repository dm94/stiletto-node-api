import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';
import { ClanInfo, ClanInfoType } from '../../types/clans';

const routes: FastifyPluginAsync = async (server) => {
  server.get<{ Reply: ClanInfoType[] }>(
    '/',
    {
      schema: {
        response: {
          200: Type.Array(ClanInfo),
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
