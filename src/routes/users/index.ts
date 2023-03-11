import { FastifyPluginAsync } from 'fastify';
import { UserInfo, UserSchema } from '@customtypes/user';
import { Type } from '@sinclair/typebox';

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
      let bearer = request.headers.authorization;
      bearer = bearer?.replace('Bearer', '').trim();

      server.mysql.query(
        'select users.nickname, users.discordtag, users.discordID discordid, users.clanid, clans.name clanname, clans.leaderid, clans.discordid serverdiscord from users left join clans on users.clanid=clans.clanid where users.token=?',
        bearer,
        (err, result) => {
          if (result && result[0]) {
            return reply.code(200).send({
              nickname: result[0].nickname ?? undefined,
              discordtag: result[0].discordtag,
              clanid: result[0].clanid ?? undefined,
              clanname: result[0].clanname ?? undefined,
              leaderid: result[0].leaderid ?? undefined,
              serverdiscord: result[0].serverdiscord ?? undefined,
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
  server.put<{ Reply }>(
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
};

export default routes;
