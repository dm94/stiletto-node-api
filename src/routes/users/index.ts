import { FastifyPluginAsync } from 'fastify';
import { UserInfo, UserSchema } from '@customtypes/user';

const routes: FastifyPluginAsync = async (server) => {
  server.get<{ Reply: UserInfo }>(
    '/',
    {
      onRequest: [server.authenticate],
      schema: {
        description: 'Returns a user information',
        summary: 'getUser',
        operationId: 'getUser',
        tags: ['users'],
        response: {
          200: UserSchema,
        },
      },
    },
    async function () {
      return {
          nickname: 'string',
          discordtag: 'string',
          clanid: 0,
          clanname: 'string',
          leaderid: 'string',
        };
    },
  );
};

export default routes;
