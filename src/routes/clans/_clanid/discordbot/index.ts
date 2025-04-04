import { type DiscordConfig, DiscordConfigSchema, Languages } from '@customtypes/discordconfig';
import type {
  GetDiscordConfigRequest,
  UpdateDiscordConfigRequest,
} from '@customtypes/requests/clans';
import { Permission } from '@customtypes/permissions';
import { Type } from '@sinclair/typebox';
import type { FastifyPluginAsync } from 'fastify';
import { addPermissions } from '@services/permission';
import {
  Error400Default,
  Error401Default,
  Error404Default,
  Error405Default,
  Error503Default,
} from '@customtypes/errors';

const routes: FastifyPluginAsync = async (server) => {
  server.get<GetDiscordConfigRequest, { Reply: DiscordConfig }>(
    '/',
    {
      onRequest: [server.authenticate],
      schema: {
        description: 'Return the bot configuration',
        summary: 'getDiscordConfig',
        operationId: 'getDiscordConfig',
        tags: ['clans', 'bot'],
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
          200: DiscordConfigSchema,
          400: Error400Default,
          401: Error401Default,
          404: Error404Default,
          405: Error405Default,
          503: Error503Default,
        },
      },
    },
    (request, reply) => {
      if (request.params?.clanid) {
        if (Number(request.dbuser.clanid) !== Number(request.params.clanid)) {
          return reply.code(401).send({ message: 'You are not a member of this clan' });
        }

        if (request.dbuser?.serverdiscord) {
          server.mysql.query(
            'select serverdiscordid, botlanguaje, readclanlog, automatickick, setnotreadypvp, walkeralarm from botconfigs where serverdiscordid=?',
            request.dbuser.serverdiscord,
            (err, result) => {
              if (result?.[0]) {
                return reply.code(200).send({
                  discordid: result[0].serverdiscordid,
                  botLanguaje: result[0].botlanguaje,
                  readClanLog: result[0].readclanlog,
                  automaticKick: result[0].automatickick,
                  setNotReadyPVP: result[0].setnotreadypvp,
                  walkerAlarm: result[0].walkeralarm,
                });
              }
              if (err) {
                return reply.code(503).send();
              }
              return reply.code(404).send();
            },
          );
        } else {
          return reply.code(405).send({ message: 'Your clan does not have a linked discord' });
        }
      } else {
        return reply.code(400).send();
      }
    },
  );
  server.put<UpdateDiscordConfigRequest>(
    '/',
    {
      onRequest: [
        server.authenticate,
        (request, _reply, done) => addPermissions(server, request, done),
      ],
      schema: {
        description: ' Update the bot Config',
        summary: 'updateBotConfig',
        operationId: 'updateBotConfig',
        tags: ['clans', 'bot'],
        params: {
          type: 'object',
          properties: {
            clanid: { type: 'integer' },
          },
        },
        querystring: {
          type: 'object',
          required: [],
          properties: {
            languaje: {
              type: 'string',
              maxLength: 2,
              default: 'en',
              enum: Object.values(Languages),
            },
            clanlog: {
              type: 'boolean',
            },
            kick: {
              type: 'boolean',
            },
            readypvp: {
              type: 'boolean',
            },
            walkeralarm: {
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
          200: Type.Object({
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
      if (request.params?.clanid) {
        if (Number(request.dbuser.clanid) !== Number(request.params.clanid)) {
          return reply.code(401).send();
        }

        if (request.dbuser?.serverdiscord) {
          if (
            request?.dbuser.discordid !== request?.dbuser.leaderid &&
            (!request?.clanPermissions || !request.clanPermissions[Permission.BOT])
          ) {
            return reply
              .code(401)
              .send({ message: 'You do not have permissions to perform this action' });
          }

          const languaje: string = request.query?.languaje ?? Languages.EN;
          const clanLog: boolean = request.query?.clanlog ?? true;
          const kick: boolean = request.query?.kick ?? true;
          const readyPvp: boolean = request.query?.readypvp ?? true;
          const walkerAlarm: boolean = request.query?.walkeralarm ?? true;

          if (languaje.length > 2) {
            return reply.code(400).send({ message: 'The language parameter is not valid' });
          }

          server.mysql.query(
            'insert into botconfigs(serverdiscordid,botlanguaje,readclanlog,automatickick,setnotreadypvp,walkeralarm) values(?,?,?,?,?,?) ON DUPLICATE KEY UPDATE botlanguaje=?, readclanlog=?, automatickick=?, setnotreadypvp=?, walkeralarm=?',
            [
              request.dbuser.serverdiscord,
              languaje,
              clanLog,
              kick,
              readyPvp,
              walkerAlarm,
              languaje,
              clanLog,
              kick,
              readyPvp,
              walkerAlarm,
            ],
            (err, result) => {
              if (result) {
                return reply.code(200).send({
                  message: 'Config updated',
                });
              }
              if (err) {
                return reply.code(503).send();
              }
            },
          );
        } else {
          return reply.code(405).send({ message: 'Your clan does not have a linked discord' });
        }
      } else {
        return reply.code(400).send();
      }
    },
  );
};

export default routes;
