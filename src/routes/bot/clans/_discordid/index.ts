import {
  Error400Default,
  Error401Default,
  Error404Default,
  Error503Default,
} from '@customtypes/errors';
import { Permission, type Permissions, PermissionsSchema } from '@customtypes/permissions';
import { type RelationshipInfo, RelationshipSchema } from '@customtypes/relationships';
import type {
  GetDiscordServerRequest,
  KickFromClanRequest,
  LinkClanRequest,
} from '@customtypes/requests/bot';
import { hasPermissions } from '@services/permission';
import { Type } from '@sinclair/typebox';
import type { FastifyPluginAsync } from 'fastify';

const routes: FastifyPluginAsync = async (server) => {
  server.post<LinkClanRequest>(
    '/',
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
          400: Error400Default,
          401: Error401Default,
          404: Error404Default,
          503: Error503Default,
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
          if (r?.[0]) {
            const clanId = r[0].clanid;
            const leaderId = r[0].leaderid;

            if (clanId && leaderId && (memberId === leaderId || hasPermissions(server, memberId, Permission.BOT))) {
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
  server.delete<KickFromClanRequest>(
    '/',
    {
      onRequest: [server.botAuth],
      schema: {
        description: 'Kick a clan member',
        summary: 'kickFromClan',
        operationId: 'kickFromClan',
        tags: ['bot', 'clan'],
        params: {
          type: 'object',
          properties: {
            discordid: { type: 'string' },
          },
        },
        querystring: {
          type: 'object',
          required: ['nick'],
          properties: {
            nick: {
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
          204: Type.Object({
            message: Type.String(),
          }),
          400: Error400Default,
          401: Error401Default,
          404: Error404Default,
          503: Error503Default,
        },
      },
    },
    (request, reply) => {
      if (!request?.params?.discordid || !request.query?.nick) {
        return reply.code(400).send();
      }

      const serverDiscordId: string = request.params.discordid;
      const nick: string = request.query?.nick;

      server.mysql.query(
        'select users.discordID, users.clanid from users, clans where users.clanid=clans.clanid and users.nickname=? and clans.discordid=?',
        [nick, serverDiscordId],
        (e, r) => {
          if (r?.[0]) {
            const clanId = r[0].clanid;
            const discordId = r[0].discordID;

            if (clanId && discordId) {
              server.mysql.query('delete from clanpermissions where discordID=? and clanid=?', [
                discordId,
                clanId,
              ]);
              server.mysql.query('update users set clanid=null where discordID=?', [discordId]);
              return reply.code(204).send();
            }
            return reply.code(401).send();
          }

          if (e) {
            return reply.code(503).send();
          }

          return reply.code(404).send();
        },
      );
    },
  );
  server.get<GetDiscordServerRequest, { Reply: Permissions[] }>(
    '/members',
    {
      onRequest: [server.botAuth],
      schema: {
        description: 'Return clan members permisions',
        summary: 'getMembersPermisionsBot',
        operationId: 'getMembersPermisionsBot',
        tags: ['bot', 'clan'],
        params: {
          type: 'object',
          properties: {
            discordid: { type: 'string' },
          },
        },
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: Type.Array(PermissionsSchema),
          400: Error400Default,
          401: Error401Default,
          503: Error503Default,
        },
      },
    },
    (request, reply) => {
      if (!request?.params?.discordid) {
        return reply.code(400).send();
      }

      server.mysql.query(
        'SELECT clanpermissions.clanid, clanpermissions.discordID as discordid, clanpermissions.request, clanpermissions.kickmembers, clanpermissions.walkers, clanpermissions.bot, clanpermissions.diplomacy FROM clanpermissions, clans WHERE clanpermissions.clanid=clans.clanid and clans.discordid=?',
        [request.params.discordid],
        (e, result) => {
          if (result) {
            return reply.code(200).send(result);
          }
          if (e) {
            return reply.code(503).send();
          }
        },
      );
    },
  );
  server.get<GetDiscordServerRequest, { Reply: RelationshipInfo[] }>(
    '/relationships',
    {
      onRequest: [server.botAuth],
      schema: {
        description: 'Return the list of relationships for the clan',
        summary: 'getRelationshipsByBot',
        operationId: 'getRelationshipsByBot',
        tags: ['bot', 'clan'],
        params: {
          type: 'object',
          properties: {
            discordid: { type: 'string' },
          },
        },
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: Type.Array(RelationshipSchema),
          400: Error400Default,
          401: Error401Default,
          503: Error503Default,
        },
      },
    },
    (request, reply) => {
      if (!request?.params?.discordid) {
        return reply.code(400).send();
      }

      server.mysql.query(
        'SELECT clans.leaderid, diplomacy.id, diplomacy.typed, diplomacy.clanflag flagcolor, diplomacy.nameotherclan name, diplomacy.symbol FROM clans LEFT JOIN diplomacy on clans.clanid=diplomacy.idcreatorclan where clans.discordid=?',
        [request.params.discordid],
        (e, result) => {
          if (result) {
            return reply.code(200).send(result);
          }
          if (e) {
            return reply.code(503).send();
          }
        },
      );
    },
  );
};

export default routes;
