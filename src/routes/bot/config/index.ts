import { DiscordConfigBot, DiscordConfigBotSchema, Languages } from '@customtypes/discordconfig';
import { GetDiscordServerRequest, UpdateBotConfigByServerRequest } from '@customtypes/requests/bot';
import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

const routes: FastifyPluginAsync = async (server) => {
  server.get<{ Reply: DiscordConfigBot[] }>(
    '/',
    {
      onRequest: [server.botAuth],
      schema: {
        description: 'Get all Bot Configs',
        summary: 'getBotConfigs',
        operationId: 'getBotConfigs',
        tags: ['bot'],
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: Type.Array(DiscordConfigBotSchema),
        },
      },
    },
    (request, reply) => {
      server.mysql.query(
        'select serverdiscordid, botlanguaje, readclanlog, automatickick, setnotreadypvp, walkeralarm from botconfigs',
        (err, result: DiscordConfigBot[]) => {
          if (result) {
            return reply.code(200).send(result);
          }
          if (err) {
            return reply.code(503).send();
          }
        },
      );
    },
  );
  server.get<GetDiscordServerRequest, { Reply: DiscordConfigBot }>(
    '/:discordid',
    {
      onRequest: [server.botAuth],
      schema: {
        description: 'Get Discord Config By Server',
        summary: 'getDiscordConfigByServer',
        operationId: 'getDiscordConfigByServer',
        tags: ['bot'],
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
          200: DiscordConfigBotSchema,
        },
      },
    },
    (request, reply) => {
      if (!request?.params?.discordid) {
        return reply.code(400).send();
      }

      const serverDiscordId: string = request.params.discordid;

      server.mysql.query(
        'select serverdiscordid, botlanguaje, readclanlog, automatickick, setnotreadypvp, walkeralarm from botconfigs where serverdiscordid=?',
        [serverDiscordId],
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
    },
  );
  server.put<UpdateBotConfigByServerRequest>(
    '/:discordid',
    {
      onRequest: [server.botAuth],
      schema: {
        description: 'Update Bot Config By Server',
        summary: 'updateBotConfigByServer',
        operationId: 'updateBotConfigByServer',
        tags: ['bot'],
        params: {
          type: 'object',
          properties: {
            discordid: { type: 'string' },
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
            apiKey: [],
          },
        ],
        response: {
          200: Type.Object({
            message: Type.String(),
          }),
        },
      },
    },
    (request, reply) => {
      if (!request?.params?.discordid) {
        return reply.code(400).send();
      }

      const serverDiscordId: string = request.params.discordid;

      const languaje: Languages = request.query?.languaje ?? Languages.EN;
      const clanLog: boolean = request.query?.clanlog ?? true;
      const kick: boolean = request.query?.kick ?? true;
      const readyPvp: boolean = request.query?.readypvp ?? true;
      const walkerAlarm: boolean = request.query?.walkeralarm ?? true;

      server.mysql.query(
        'insert into botconfigs(serverdiscordid,botlanguaje,readclanlog,automatickick,setnotreadypvp,walkeralarm) values(?,?,?,?,?,?) ON DUPLICATE KEY UPDATE botlanguaje=?, readclanlog=?, automatickick=?, setnotreadypvp=?, walkeralarm=?',
        [
          serverDiscordId,
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
    },
  );
};

export default routes;
