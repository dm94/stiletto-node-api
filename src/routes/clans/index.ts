import { ClanInfo, ClanSchema } from '@customtypes/clans';
import { Error503Default } from '@customtypes/errors';
import { CreateClanRequest, GetClansRequest } from '@customtypes/requests/clans';
import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

const routes: FastifyPluginAsync = async (server) => {
  server.get<GetClansRequest, { Reply: ClanInfo[] }>(
    '/',
    {
      schema: {
        description: 'Return the list of clans',
        summary: 'getClans',
        operationId: 'getClans',
        tags: ['clans'],
        querystring: {
          type: 'object',
          required: [],
          properties: {
            pageSize: {
              type: 'integer',
              default: 10,
            },
            page: {
              type: 'integer',
              default: 1,
            },
            name: {
              type: 'string',
              description: 'Filter by Clan name',
            },
            region: {
              type: 'string',
              description: 'Filter by region',
            },
          },
        },
        response: {
          200: Type.Array(ClanSchema),
          503: Error503Default,
        },
      },
    },
    (request, reply) => {
      const pageSize: number =
        request.query?.pageSize && request.query?.pageSize > 0 ? request.query.pageSize : 10;

      const page: number = request.query?.page && request.query.page > 0 ? request.query.page : 1;
      const name: string | undefined = request.query?.name
        ? server.mysql.escape(`%${request.query.name}%`)
        : undefined;

      const region: string | undefined = request.query?.region
        ? server.mysql.escape(request.query.region)
        : undefined;

      const offset = pageSize * (page - 1);

      let sql =
        'select clans.clanid, clans.name, clans.discordid, clans.leaderid, clans.invitelink, clans.recruitment, clans.flagcolor, clans.symbol, clans.region, users.discordTag from clans, users where clans.leaderid=users.discordID and clans.recruitment = 1';
      if (name) {
        sql += ` and clans.name like ${name}`;
      }

      if (region) {
        sql += ` and clans.region like ${region}`;
      }

      sql += ` LIMIT ${pageSize} OFFSET ${offset}`;

      server.mysql.query(sql, (err, result) => {
        if (result) {
          return reply.code(200).send(result);
        }
        if (err) {
          return reply.code(503).send();
        }
      });
    },
  );
  server.post<CreateClanRequest>(
    '/',
    {
      onRequest: [server.authenticate],
      schema: {
        description: 'To create a new clan',
        summary: 'createClan',
        operationId: 'createClan',
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

      if (request.dbuser.clanid) {
        return reply.code(405).send({
          message: 'You already have a clan',
        });
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

        const date = new Date().toISOString().split('T')[0];

        server.mysql.query(
          'insert into clans(name,leaderid,invitelink,flagcolor,creationdate, recruitment, region, symbol) values(?,?,?,?,?,?,?,?)',
          [name, request.dbuser.discordid, discord, color, date, recruit, region, symbol],
          (err, result) => {
            if (result) {
              server.mysql.query(
                'select clanid from clans where leaderid=?',
                [request.dbuser.discordid],
                (erro, result1) => {
                  if (result1 && result1[0]?.clanid) {
                    const clanId = result1[0].clanid;
                    server.mysql.query(
                      'update users set clanid=? where discordID=?',
                      [clanId, request.dbuser.discordid],
                      (error, result2) => {
                        if (result2) {
                          return reply.code(201).send({
                            message: 'Clan created',
                          });
                        } else if (error) {
                          return reply.code(503).send();
                        }
                      },
                    );
                  } else if (erro) {
                    return reply.code(503).send();
                  }
                },
              );
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
  server.delete(
    '/',
    {
      onRequest: [server.authenticate],
      schema: {
        description: 'Leave a clan',
        summary: 'leaveClan',
        operationId: 'leaveClan',
        tags: ['clans'],
        security: [
          {
            token: [],
          },
        ],
        response: {
          204: Type.Object({
            message: Type.String(),
          }),
          503: Error503Default,
        },
      },
    },
    (request, reply) => {
      if (!request?.dbuser) {
        reply.code(401);
        return new Error('Invalid token JWT');
      }
      if (!request?.dbuser.clanid) {
        reply.code(401);
        return new Error('You do not have a clan');
      }

      if (request?.dbuser.discordid === request?.dbuser.leaderid) {
        reply.code(405);
        return new Error("You can't leave a clan if you are the clan leader");
      }

      const clanId = Number(request.dbuser.clanid);
      const discordId = String(request.dbuser.discordid);
      server.mysql.query(
        'delete from clanpermissions where discordID=? and clanid=?',
        [discordId, clanId],
        (err) => {
          if (err) {
            return reply.code(503).send();
          }
        },
      );

      server.mysql.query('update users set clanid=null where discordID=?', [discordId], (err) => {
        if (err) {
          return reply.code(503).send();
        }
      });

      return reply.code(204).send();
    },
  );
};

export default routes;
