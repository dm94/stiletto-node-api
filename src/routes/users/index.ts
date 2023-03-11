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
      },
    },
    (request, reply) => {
      let bearer = request.headers.authorization;
      bearer = bearer?.replace('Bearer', '').trim();
      console.log('bearer', bearer);

      server.mysql.query(
        'select users.nickname, users.discordtag, users.discordID discordid, users.clanid, clans.name clanname, clans.leaderid, clans.discordid serverdiscord from users left join clans on users.clanid=clans.clanid where users.token=?',
        bearer,
        (err, result) => {
          if (result && result[0]) {
            return reply.code(200).send(result[0]);
          }
          if (err) {
            reply.code(401);
            return new Error('Invalid token JWT');
          }
        },
      );
    },
  );
  server.put<{ Reply: UserInfo }>(
    '/',
    {
      onRequest: [server.authenticate],
      schema: {
        description: 'Returns a user information',
        summary: 'getUser',
        operationId: 'getUser',
        tags: ['users'],
        response: {
          202: Type.Object({
            Success: Type.String(),
          }),
        },
      },
    },
    (request, reply) => {
      server.mysql.getConnection((err, client) => {
        if (err) {
          reply.code(500);
          return new Error('Error with the database connection');
        }

        client.query(
          'update users set nickname=? where discordID=?',
          ['asd', 'asd'],
          (err, result) => {
            client.release();
            if (err) {
              reply.code(401);
              return new Error('Invalid token JWT');
            }
            if (result && result[0]) {
              return reply.code(200).send(result[0]);
            }
          },
        );
      });
    },
  );
};

export default routes;
