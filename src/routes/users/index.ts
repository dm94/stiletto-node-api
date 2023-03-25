import { FastifyPluginAsync } from 'fastify';
import { UserInfo, UserSchema } from '@customtypes/user';
import { Type } from '@sinclair/typebox';
import { sendDiscordMessage } from '@services/DiscordWebhook';
import { AddNickRequest } from '@customtypes/requests/users';

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
        security: [
          {
            token: [],
          },
        ],
      },
    },
    (request, reply) => {
      if (request.dbuser?.discordid) {
        return reply.code(200).send(request.dbuser as UserInfo);
      } else {
        reply.code(401);
        return new Error('Invalid token JWT');
      }
    },
  );
  server.put<AddNickRequest, { Reply }>(
    '/',
    {
      onRequest: [server.authenticate],
      schema: {
        description: "Update a user's game name",
        summary: 'addNick',
        operationId: 'addNick',
        tags: ['users'],
        querystring: {
          type: 'object',
          required: ['dataupdate'],
          properties: {
            dataupdate: {
              type: 'string',
              description: 'Nick to be added',
            },
          },
        },
        response: {
          202: Type.Object({
            message: Type.String(),
          }),
        },
        security: [
          {
            token: [],
          },
        ],
      },
    },
    (request, reply) => {
      let bearer = request.headers.authorization;
      bearer = bearer?.replace('Bearer', '').trim();

      const dataupdate = request.query?.dataupdate;

      if (dataupdate) {
        server.mysql.query(
          'update users set nickname=? where token=?',
          [dataupdate, bearer],
          (err, result) => {
            return reply.code(202).send({
              message: 'The nick to user has been added correctly',
            });
          },
        );
      } else {
        return reply.code(400);
      }
    },
  );
  server.delete<{ Reply }>(
    '/',
    {
      onRequest: [server.authenticate],
      schema: {
        description: 'Delete the user',
        summary: 'deleteUser',
        operationId: 'deleteUser',
        tags: ['users'],
        response: {
          204: Type.Object({
            message: Type.String(),
          }),
        },
        security: [
          {
            token: [],
          },
        ],
      },
    },
    (request, reply) => {
      let bearer = request.headers.authorization;
      bearer = bearer?.replace('Bearer', '').trim();

      server.mysql.query(
        'select users.nickname, users.discordtag, users.discordID discordid, users.clanid, clans.name clanname, clans.leaderid, clans.discordid serverdiscord from users left join clans on users.clanid=clans.clanid where users.token=?',
        bearer,
        (err, result) => {
          if (result && result[0]) {
            sendDiscordMessage(
              JSON.stringify({
                content: `User ${result[0].discordid} wants to delete his account`,
                username: 'stiletto.live',
                tts: true,
              }),
            );

            return reply.code(204).send({
              message: 'The admin has been notified to delete your user',
            });
          }
          if (err) {
            reply.code(401);
            return new Error('Invalid token JWT');
          }
        },
      );
    },
  );
};

export default routes;
