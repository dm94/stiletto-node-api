import type { FastifyPluginAsync } from 'fastify';
import { type LoginInfo, LoginSchema } from '@customtypes/user';
import { Error503Default } from '@customtypes/errors';
import { getAccessToken, getUser } from '@services/DiscordAPI';
import type { AuthRequest } from '@customtypes/requests/users';

const routes: FastifyPluginAsync = async (server) => {
  server.post<AuthRequest, { Reply: LoginInfo }>(
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
          202: LoginSchema,
          503: Error503Default,
        },
      },
    },
    async (request, reply) => {
      const accessToken = await getAccessToken(request.query.code);

      if (accessToken?.access_token) {
        const user = await getUser(accessToken.access_token);

        if (user) {
          const username = `${user.username}#${user.discriminator}`;
          const discordId = user.id;

          if (discordId) {
            const token = await reply.jwtSign({ discordid: discordId }, { expiresIn: '30d' });

            const date = new Date().toISOString().split('T')[0];
            server.mysql.query(
              'INSERT INTO users(discordID, discordTag,token,createdAt) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE token=?, lastUpdate=?',
              [discordId, username, token, date, token, date],
            );

            return reply.code(202).send({
              discordid: discordId,
              token: token,
            });
          }
          return reply.code(400).send();
        }
        return reply.code(400).send();
      }
      return reply.code(500).send();
    },
  );
};

export default routes;
