import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';
import { ClanInfo, ClanInfoSchema } from '../../types/clans';

const routes: FastifyPluginAsync = async (server) => {
  server.get<{ Reply: ClanInfo[] }>(
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
          200: Type.Array(ClanInfoSchema),
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
          const clanList: ClanInfo[] = result;
          return reply.code(200).send(clanList);
        }
        if (err) {
          return reply.code(503);
        }
      });
    },
  );
};

export default routes;
