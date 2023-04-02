import { FastifyPluginAsync } from 'fastify';
import { Type } from '@sinclair/typebox';
import { WalkerInfo } from '@customtypes/walkers';
import { GetDiscordServersRequest } from '@customtypes/requests/walkers';

const routes: FastifyPluginAsync = async (server) => {
  server.get<GetDiscordServersRequest, { Reply: WalkerInfo[] }>(
    '/',
    {
      onRequest: [server.authenticate],
      schema: {
        description: 'Get discord servers from user',
        summary: 'getDiscordServers',
        operationId: 'getDiscordServers',
        tags: ['walkers'],
        querystring: {
          type: 'object',
          required: ['code', 'redirect'],
          properties: {
            code: {
              type: 'string',
            },
            redirect: {
              type: 'string',
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
        },
      },
    },
    async (request, reply) => {
      if (!request?.dbuser) {
        reply.code(401);
        return new Error('Invalid token JWT');
      }
      if (!request?.dbuser.clanid) {
        reply.code(405);
        return new Error('No clan');
      }
      if (request?.dbuser.discordid === request?.dbuser.leaderid) {
        reply.code(401);
        return new Error('This action can only be performed by the leader');
      }

      if (!request.query.redirect || !request.query.code) {
        return reply.code(400).send();
      }

      return reply.code(501).send({
        message: 'This can only be done directly from the bot',
      });
    },
  );
};

export default routes;
