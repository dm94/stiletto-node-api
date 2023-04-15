import { FastifyPluginAsync } from 'fastify';
import { LoginInfo, LoginSchema } from '@customtypes/user';
import { Error503Default } from '@customtypes/errors';
import { getAccessToken, getUser } from '@services/DiscordAPI';
import { AuthRequest } from '@customtypes/requests/users';

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
      try {
        const accessToken = await getAccessToken(request.query.code);

        if (accessToken && accessToken.access_token) {
          const user = await getUser(accessToken.access_token);

          if (user) {
            const username = `${user.username}#${user.discriminator}`;
            const discordId = user.id;

            if (discordId) {
              let token: undefined | string = undefined;
              server.mysql.query(
                'select users.nickname, users.discordtag, users.discordID discordid, users.clanid, users.token from users where users.discordID=?',
                discordId,
                (err, result) => {
                  if (result && result[0]?.token) {
                    token = result[0].token;
                  }
                },
              );

              if (token) {
                try {
                  server.jwt.verify(token, (err) => {
                    if (!err) {
                      return reply.code(202).send({
                        discordid: discordId,
                        discordTag: username,
                        token: token,
                      });
                    }
                  });
                } catch (e) {
                  console.log('The token is malformed.', discordId);
                }
              }
              token = server.jwt.sign({ discordid: discordId }, { expiresIn: '30d' });

              const date = new Date().toISOString().split('T')[0];

              server.mysql.query(
                'INSERT INTO users(discordID, discordTag,token,createdAt) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE token=?, lastUpdate=?',
                [discordId, username, token, date, token, date],
              );

              return reply.code(202).send({
                discordid: discordId,
                discordTag: username,
                token: token,
              });
            }
          }
        } else {
          return reply.code(401).send();
        }
      } catch (e) {
        return reply.code(500).send();
      }
    },
  );
};

export default routes;
