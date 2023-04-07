import { FastifyPluginAsync } from 'fastify';
import { UserInfo, UserSchema } from '@customtypes/user';
import { Type } from '@sinclair/typebox';
import { sendDiscordMessage } from '@services/DiscordWebhook';
import { AddNickRequest } from '@customtypes/requests/users';
import { Error400Default, Error401Default, Error503Default } from '@customtypes/errors';

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
          401: Error401Default,
          503: Error503Default,
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
          400: Error400Default,
          401: Error401Default,
          503: Error503Default,
        },
        security: [
          {
            token: [],
          },
        ],
      },
    },
    (request, reply) => {
      if (!request?.dbuser) {
        reply.code(401);
        return new Error('Invalid token JWT');
      }
      const dataupdate: string | undefined = request.query?.dataupdate;

      if (dataupdate) {
        server.mysql.query(
          'update users set nickname=? where discordID=?',
          [dataupdate, request.dbuser.discordid],
          (err, result) => {
            if (result) {
              return reply.code(202).send({
                message: 'The nick to user has been added correctly',
              });
            }
            if (err) {
              return reply.code(503).send();
            }
          },
        );
      } else {
        return reply.code(400).send();
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
          401: Error401Default,
          503: Error503Default,
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
        sendDiscordMessage(
          JSON.stringify({
            content: `User ${request.dbuser.discordid} wants to delete his account`,
            username: 'stiletto.live',
            tts: true,
          }),
        );

        return reply.code(204).send();
      } else {
        reply.code(401);
        return new Error('Invalid token JWT');
      }
    },
  );
};

export default routes;
