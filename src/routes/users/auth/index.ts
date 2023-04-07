import { FastifyPluginAsync } from 'fastify';
import { LoginInfo, LoginSchema } from '@customtypes/user';
import { getLoginInfo } from '@services/auth';
import { Error503Default } from '@customtypes/errors';

const routes: FastifyPluginAsync = async (server) => {
  server.post<{ Reply: LoginInfo }>(
    '/',
    {
      schema: {
        description: 'To create a new account with discord or get the token',
        summary: 'authDiscord',
        operationId: 'authDiscord',
        tags: ['users'],
        querystring: {
          type: 'object',
          required: ['code'],
          properties: {
            code: {
              type: 'string',
              description: 'Discord Code',
            },
          },
        },
        response: {
          200: LoginSchema,
          503: Error503Default,
        },
      },
    },
    async (request, reply) => {
      try {
        return await getLoginInfo(server, request, reply);
      } catch (e) {
        reply.code(500).send();
      }
    },
  );
};

export default routes;
