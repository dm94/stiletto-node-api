import { MemberInfo, MemberSchema } from '@customtypes/members';
import { GetClanRequest } from '@customtypes/requests/clans';
import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

const routes: FastifyPluginAsync = async (server) => {
  server.get<GetClanRequest, { Reply: MemberInfo[] }>(
    '/',
    {
      onRequest: [server.authenticate],
      schema: {
        description: 'Return the information of the clan members',
        summary: 'getMembers',
        operationId: 'getMembers',
        tags: ['clans'],
        params: {
          type: 'object',
          properties: {
            clanid: { type: 'integer' },
          },
        },
        security: [
          {
            token: [],
          },
        ],
        response: {
          200: Type.Array(MemberSchema),
        },
      },
    },
    (request, reply) => {
      if (!request?.dbuser) {
        reply.code(401);
        return new Error('Invalid token JWT');
      }
      if (Number(request.dbuser.clanid) !== Number(request.params.clanid)) {
        reply.code(401);
        return new Error('You are not a member of this clan');
      }

      if (request.params?.clanid) {
        const clanId = Number(request.params.clanid);
        server.mysql.query(
          'select users.discordid, users.nickname, users.discordtag, clans.leaderid from users,clans where users.clanid=clans.clanid and users.clanid=?',
          clanId,
          (err, result) => {
            if (result) {
              return reply.code(200).send(result as MemberInfo[]);
            } else if (err) {
              return reply.code(503).send();
            } else {
              return reply.code(404).send();
            }
          },
        );
      } else {
        return reply.code(400).send();
      }
    },
  );
};

export default routes;