import { DiscordConfigBot, DiscordConfigBotSchema } from '@customtypes/discordconfig';
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
};

export default routes;
