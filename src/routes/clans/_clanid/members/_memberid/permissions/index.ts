import { Permissions, PermissionsSchema } from '@customtypes/permissions';
import { GetMemberPermissionsRequest } from '@customtypes/requests/members';
import { FastifyPluginAsync } from 'fastify';

const routes: FastifyPluginAsync = async (server) => {
  server.get<GetMemberPermissionsRequest, { Reply: Permissions }>(
    '/',
    {
      onRequest: [server.authenticate],
      schema: {
        description:
          'Return a clan member&#39;s permissions Only the clan leader and the clan member can use this endpoint.',
        summary: 'getMemberPermissions',
        operationId: 'getMemberPermissions',
        tags: ['clans'],
        params: {
          type: 'object',
          properties: {
            clanid: { type: 'integer' },
            memberid: { type: 'string' },
          },
        },
        security: [
          {
            token: [],
          },
        ],
        response: {
          200: PermissionsSchema,
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

      if (!request.params?.clanid || !request.params?.memberid) {
        return reply.code(400).send();
      }

      const memberId = request.params.memberid;

      if (
        request?.dbuser.discordid !== request?.dbuser.leaderid &&
        request?.dbuser.discordid !== memberId
      ) {
        reply.code(401);
        return new Error('You do not have permissions to perform this action');
      }

      server.mysql.query(
        'select clanid, discordID, request, kickmembers, walkers, bot, diplomacy from clanpermissions where clanid=? and discordID=?',
        [request.dbuser.clanid, memberId],
        (err, result) => {
          if (result && result[0]) {
            return reply.code(200).send({
              clanid: result[0].clanid,
              discordid: result[0].discordID,
              request: Boolean(result[0].request),
              kickmembers: Boolean(result[0].kickmembers),
              walkers: Boolean(result[0].walkers),
              bot: Boolean(result[0].bot),
              diplomacy: Boolean(result[0].diplomacy),
            });
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
