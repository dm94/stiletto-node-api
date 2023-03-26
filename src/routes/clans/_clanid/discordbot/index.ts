import { DiscordConfig, DiscordConfigSchema } from '@customtypes/discordconfig';
import { GetDiscordConfigRequest } from '@customtypes/requests/clans';
import { FastifyPluginAsync } from 'fastify';

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
        },
      },
    },
    (request, reply) => {
      if (request.params?.clanid) {
        if (Number(request.dbuser.clanid) !== Number(request.params.clanid)) {
          reply.code(401);
          return new Error('You are not a member of this clan');
        }

        if (request.dbuser?.serverdiscord) {
          server.mysql.query(
            'select serverdiscordid, botlanguaje, readclanlog, automatickick, setnotreadypvp, walkeralarm from botconfigs where serverdiscordid=?',
            request.dbuser.serverdiscord,
            (err, result) => {
              if (result && result[0]) {
                return reply.code(200).send({
                  discordid: result[0].serverdiscordid,
                  botLanguaje: result[0].botlanguaje,
                  readClanLog: result[0].readclanlog,
                  automaticKick: result[0].automatickick,
                  setNotReadyPVP: result[0].setnotreadypvp,
                  walkerAlarm: result[0].walkeralarm,
                });
              } else if (err) {
                return reply.code(503).send();
              } else {
                return reply.code(404).send();
              }
            },
          );
        } else {
          reply.code(405);
          return new Error('Your clan does not have a linked discord');
        }
      } else {
        return reply.code(400).send();
      }
    },
  );
};

export default routes;
