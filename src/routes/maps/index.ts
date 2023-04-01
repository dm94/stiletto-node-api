import { MapInfo, MapSchema } from '@customtypes/maps';
import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

const routes: FastifyPluginAsync = async (server) => {
  server.get<{ Reply: MapInfo[] }>(
    '/',
    {
      onRequest: [server.authenticate],
      schema: {
        description: "Return your map list and your clan's maps",
        summary: 'getMaps',
        operationId: 'getMaps',
        tags: ['maps'],
        security: [
          {
            token: [],
          },
        ],
        response: {
          200: Type.Array(MapSchema),
        },
      },
    },
    (request, reply) => {
      if (!request?.dbuser) {
        reply.code(401);
        return new Error('Invalid token JWT');
      }

      if (request.dbuser.clanid) {
        server.mysql.query(
          'select clanmaps.mapid, clanmaps.typemap, clanmaps.discordid, clanmaps.name, clanmaps.dateofburning, clanmaps.pass, clanmaps.allowedit, users.discordTag from clanmaps,users WHERE clanmaps.discordID=users.discordID and clanmaps.discordid in (select discordID from users where clanid=?)',
          request.dbuser.clanid,
          (err, result) => {
            if (result) {
              return reply.code(200).send(result as MapInfo[]);
            } else if (err) {
              return reply.code(503).send();
            } else {
              return reply.code(404).send();
            }
          },
        );
      } else {
        server.mysql.query(
          'select clanmaps.mapid, clanmaps.typemap, clanmaps.discordid, clanmaps.name, clanmaps.dateofburning, clanmaps.pass, clanmaps.allowedit from clanmaps WHERE clanmaps.discordID=?',
          request.dbuser.discordid,
          (err, result) => {
            if (result) {
              return reply.code(200).send(result as MapInfo[]);
            } else if (err) {
              return reply.code(503).send();
            } else {
              return reply.code(404).send();
            }
          },
        );
      }
    },
  );
};

export default routes;
