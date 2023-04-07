import { ClanInfo, ClanSchema } from '@customtypes/clans';
import {
  Error400Default,
  Error401Default,
  Error404Default,
  Error405Default,
  Error503Default,
} from '@customtypes/errors';
import { DeleteClanRequest, GetClanRequest, UpdateClanRequest } from '@customtypes/requests/clans';
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
          200: ClanSchema,
          400: Error400Default,
          404: Error404Default,
          503: Error503Default,
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
  server.put<UpdateClanRequest>(
    '/',
    {
      onRequest: [server.authenticate],
      schema: {
        description: 'To update the clan. Only the leader can use this endpoint',
        summary: 'updateClan',
        operationId: 'updateClan',
        tags: ['clans'],
        querystring: {
          type: 'object',
          required: ['clanname'],
          properties: {
            clanname: {
              type: 'string',
              description: 'Name of Clan',
            },
            clancolor: {
              type: 'string',
              description: 'The colour of the clan in hexadecimal',
            },
            clandiscord: {
              type: 'string',
              description: 'Discord server invitation code',
            },
            region: {
              type: 'string',
              description: 'Region of the clan',
            },
            symbol: {
              type: 'string',
              description: 'Symbol of the clan',
            },
            recruit: {
              type: 'boolean',
            },
          },
        },
        security: [
          {
            token: [],
          },
        ],
        response: {
          201: Type.Object({
            message: Type.String(),
          }),
          400: Error400Default,
          401: Error401Default,
          405: Error405Default,
          503: Error503Default,
        },
      },
    },
    (request, reply) => {
      const name: string | undefined = request.query?.clanname ?? undefined;
      let region: string | undefined = request.query?.region ?? undefined;
      const color: string | undefined = request.query?.clancolor ?? undefined;
      const discord: string | undefined = request.query?.clandiscord ?? undefined;
      const symbol: string | undefined = request.query?.symbol ?? undefined;
      const recruit: boolean = request.query?.recruit ?? true;

      if (!request?.dbuser) {
        reply.code(401);
        return new Error('Invalid token JWT');
      }

      if (Number(request.dbuser.clanid) !== Number(request.params.clanid)) {
        reply.code(401);
        return new Error('You are not a member of this clan');
      }

      if (request?.dbuser.discordid !== request?.dbuser.leaderid) {
        reply.code(405);
        return new Error('You are not the leader of this clan');
      }

      if (
        name &&
        name.length < 50 &&
        name.length > 3 &&
        (!discord || discord.length < 10) &&
        (!color || color.length < 10) &&
        (!region || region.length < 10) &&
        (!symbol || symbol.length < 5)
      ) {
        if (region) {
          server.mysql.query(
            "select * FROM clusters WHERE CONCAT_WS(' - ', region, name) = ?",
            [region],
            (err, result) => {
              if ((result && !result[0]) || err) {
                region = 'EU-Official';
              }
            },
          );
        } else {
          region = 'EU-Official';
        }

        server.mysql.query(
          'update clans set name=?, invitelink=?, flagcolor=?, symbol=?, recruitment=?, region=? where clanid=?',
          [name, discord, color, symbol, recruit, region, Number(request.dbuser.clanid)],
          (err, result) => {
            if (result) {
              return reply.code(200).send({
                message: 'Clan updated',
              });
            } else if (err) {
              return reply.code(503).send();
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
          400: Error400Default,
          401: Error401Default,
          405: Error405Default,
          503: Error503Default,
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
        if (request?.dbuser.discordid !== request?.dbuser.leaderid) {
          reply.code(405);
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
