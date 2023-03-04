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
    function (request, reply) {
      server.mysql.getConnection(onConnect);

      function onConnect (err, client) {
        if (err) return reply.send(err);
    
        client.query(
          'select users.nickname, users.discordtag, users.discordID discordid, users.clanid, clans.name clanname, clans.leaderid, clans.discordid serverdiscord from users left join clans on users.clanid=clans.clanid where users.token=?', 'clnD8NhVbKaAwrzF',
          function onResult (err, result) {
            client.release();
            if (result && result[0]) {
              return reply.send(result[0]);
            }
            
            reply.code(401);
            return new Error('Invalid token JWT');
          }
        );
      }
    },
  );
};

export default routes;
