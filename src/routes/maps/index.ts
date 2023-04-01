import { MapInfo, MapSchema } from '@customtypes/maps';
import { AddMapRequest } from '@customtypes/requests/maps';
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
  server.post<AddMapRequest>(
    '/',
    {
      schema: {
        description:
          'To create a map. The map type has to be one defined in the map json. The bearer is required if you want it to be assigned to a user.',
        summary: 'addMap',
        operationId: 'addMap',
        tags: ['maps'],
        querystring: {
          type: 'object',
          required: ['mapname', 'mapdate', 'maptype'],
          properties: {
            mapname: {
              type: 'string',
              description: 'Map name',
            },
            mapdate: {
              type: 'string',
              description: 'Date of the day the map was burned. aaaa-mm-dd',
            },
            maptype: {
              type: 'string',
              description: 'Name of the type of map',
              enum: [
                'Canyon_new',
                'CanyonB_new',
                'SleepingGiants_new',
                'SleepingGiantsB_new',
                'Volcanic_new',
                'Crater_new',
                'Volcanyon_new',
                'AncientCity_new',
                'KaliSpires_new',
                'WormMap_new',
                'MiniOasis_new',
              ],
            },
          },
        },
        response: {
          201: Type.Object({
            Success: Type.String(),
            IdMap: Type.Integer(),
            PassMap: Type.String(),
          }),
        },
      },
    },
    (request, reply) => {
      const mapName: string = request.query?.mapname ?? 'Default Name';
      const mapDate: string = request.query?.mapdate ?? new Date().toISOString().split('T')[0];
      const mapType: string = request.query?.maptype ?? 'Crater';

      if (!mapName || !mapDate || !mapType) {
        return reply.code(400).send();
      }

      const randomPassword = Math.random().toString(36).slice(-8);

      if (request?.dbuser) {
        server.mysql.query(
          'insert into clanmaps(typemap,discordid,name,dateofburning,pass,allowedit) values(?, ?, ?, ?, ?,1)',
          [mapType, request.dbuser.discordid, mapName, mapDate, randomPassword],
          (err, result) => {
            if (result && result?.insertId) {
              return reply.code(201).send({
                Success: 'Map created',
                IdMap: result.insertId,
                PassMap: randomPassword,
              });
            } else if (err) {
              return reply.code(503).send();
            }
          },
        );
      } else {
        server.mysql.query(
          'insert into clanmaps(typemap,discordid,name,dateofburning,pass,allowedit) values(?,"437020812168396820", ?, ?, ?,1)',
          [mapType, mapName, mapDate, randomPassword],
          (err, result) => {
            if (result && result?.insertId) {
              return reply.code(201).send({
                Success: 'Map created',
                IdMap: result.insertId,
                PassMap: randomPassword,
              });
            } else if (err) {
              return reply.code(503).send();
            }
          },
        );
      }
    },
  );
};

export default routes;
