import { Permission } from '@customtypes/permissions';
import { LinkClanRequest } from '@customtypes/requests/bot';
import { hasPermissions } from '@services/permission';
import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

const routes: FastifyPluginAsync = async (server) => {
  server.post<LinkClanRequest>(
    '/:discordid',
    {
      onRequest: [server.botAuth],
      schema: {
        description:
          'Allows to link the discord server with the clan. This can only be done by clan leaders or anyone with bot permissions.',
        summary: 'linkClan',
        operationId: 'linkClan',
        tags: ['bot', 'clan'],
        params: {
          type: 'object',
          properties: {
            discordid: { type: 'string' },
          },
        },
        querystring: {
          type: 'object',
          required: ['memberid'],
          properties: {
            memberid: {
              type: 'string',
            },
          },
        },
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: Type.Object({
            Success: Type.String(),
            ClanID: Type.Integer(),
            'Server Discord ID': Type.String(),
          }),
        },
      },
    },
    (request, reply) => {
      if (!request?.params?.discordid || !request.query?.memberid) {
        return reply.code(400).send();
      }

      const serverDiscordId: string = request.params.discordid;
      const memberId: string = request.query?.memberid;

      server.mysql.query(
        'select users.discordID, users.clanid clanid, clans.leaderid from users, clans where users.clanid=clans.clanid and users.discordID=?',
        [memberId],
        (e, r) => {
          if (r && r[0]) {
            const clanId = r[0].clanid;
            const leaderId = r[0].leaderid;

            if (clanId && leaderId && hasPermissions(server, memberId, Permission.BOT)) {
              server.mysql.query(
                'update clans set discordid=? where clanid=?',
                [serverDiscordId, clanId],
                (err, result) => {
                  if (result) {
                    return reply.code(200).send({
                      Success: 'Linked server',
                      ClanID: clanId,
                      'Server Discord ID': serverDiscordId,
                    });
                  }
                  if (err) {
                    return reply.code(503).send();
                  }
                },
              );
            } else {
              return reply.code(401).send();
            }
          } else if (e) {
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
