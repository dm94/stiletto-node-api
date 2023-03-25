import { ClanInfo, ClanInfoSchema } from '@customtypes/clans';
import { DeleteClanRequest, GetClanRequest } from '@customtypes/requests/clans';
import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

const routes: FastifyPluginAsync = async (server) => {
  server.get<GetClanRequest, { Reply: ClanInfo }>(
    '/',
    {
      schema: {
        description: 'Return the information of the clan',
        summary: 'getClanInfo',
        operationId: 'getClanInfo',
        tags: ['clans'],
        params: {
          type: 'object',
          properties: {
            clanid: { type: 'integer' },
          },
        },
        response: {
          200: ClanInfoSchema,
        },
      },
    },
    (request, reply) => {
      if (request.params?.clanid) {
        const clanId = Number(request.params.clanid);
        server.mysql.query(
          'select clans.clanid, clans.name, clans.discordid, clans.leaderid, clans.invitelink, clans.recruitment, clans.flagcolor, clans.symbol, clans.region, users.discordTag from clans, users where clans.leaderid=users.discordID and clans.clanid=?',
          clanId,
          (err, result) => {
            if (result && result[0]) {
              return reply.code(200).send(result[0]);
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
  server.delete<DeleteClanRequest>(
    '/',
    {
      onRequest: [server.authenticate],
      schema: {
        description:
          'Delete a clan. It is necessary to be the leader of the clan in order to perform this action',
        summary: 'deleteClan',
        operationId: 'deleteClan',
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
          204: Type.Object({
            message: Type.String(),
          }),
        },
      },
    },
    (request, reply) => {
      if (request?.params?.clanid) {
        if (!request?.dbuser) {
          reply.code(401);
          return new Error('Invalid token JWT');
        }
        if (!request?.dbuser.clanid) {
          reply.code(401);
          return new Error('You do not have a clan');
        }
        if (Number(request.dbuser.clanid) !== Number(request.params.clanid)) {
          reply.code(401);
          return new Error('You are not the leader of this clan');
        }
        const clanId = Number(request.params.clanid);
        const discordId = String(request.dbuser.discordid);
        server.mysql.query(
          'delete from clans where clanid=? and leaderid=?',
          [clanId, discordId],
          (err) => {
            if (err) {
              return reply.code(503).send();
            }
          },
        );

        server.mysql.query('update users set clanid=null where clanid=?', [clanId], (err) => {
          if (err) {
            return reply.code(503).send();
          }
        });

        server.mysql.query('delete from diplomacy where idcreatorclan=?', [clanId], (err) => {
          if (err) {
            return reply.code(503).send();
          }
        });

        server.mysql.query('delete from clanpermissions where clanid=?', [clanId], (err) => {
          if (err) {
            return reply.code(503).send();
          }
        });

        return reply.code(204).send();
      } else {
        return reply.code(400).send();
      }
    },
  );
};

export default routes;
