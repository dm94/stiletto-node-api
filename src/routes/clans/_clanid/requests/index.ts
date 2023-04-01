import { MemberRequest, MemberRequestSchema } from '@customtypes/member-request';
import { GetClanRequest } from '@customtypes/requests/clans';
import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

const routes: FastifyPluginAsync = async (server) => {
  server.get<GetClanRequest, { Reply: MemberRequest[] }>(
    '/',
    {
      onRequest: [server.authenticate],
      schema: {
        description: 'Return the list of requests for entry to the clan',
        summary: 'getRequests',
        operationId: 'getRequests',
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
          200: Type.Array(MemberRequestSchema),
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

      if (!request.params?.clanid) {
        return reply.code(400).send();
      }

      const clanId = Number(request.params.clanid);
      server.mysql.query(
        'select users.discordid, users.nickname, users.discordtag, clans.leaderid, clanrequest.message from users,clanrequest, clans where users.discordid=clanrequest.discordid and clanrequest.clanid=clans.clanid and clanrequest.clanid=?',
        clanId,
        (err, result) => {
          if (result) {
            return reply.code(200).send(result as MemberRequest[]);
          } else if (err) {
            return reply.code(503).send();
          } else {
            return reply.code(404).send();
          }
        },
      );
    },
  );
};

export default routes;
