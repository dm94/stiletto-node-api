import { FastifyPluginAsync } from 'fastify';
import { TradeInfo, TradeSchema } from '@customtypes/trades';
import { Type } from '@sinclair/typebox';

const routes: FastifyPluginAsync = async (server) => {
  server.get<{ Reply: TradeInfo }>(
    '/',
    {
      schema: {
        description: 'Returns the trades',
        summary: 'getTrades',
        operationId: 'getTrades',
        tags: ['trades'],
        response: {
          200: Type.Array(TradeSchema),
        },
      },
    },
    (request, reply) => {
      const pageSize: number =
        request.query?.pageSize && request.query?.pageSize > 0 ? request.query.pageSize : 10;
      const page: number = request.query?.page && request.query.page > 0 ? request.query.page : 1;
      let type: string = request.query?.type ? request.query.type : 'Supply';
      const resource: string | undefined = request.query?.resource
        ? server.mysql.escape(request.query.resource)
        : undefined;
      const region: string | undefined = request.query?.region
        ? server.mysql.escape(request.query.region)
        : undefined;

      const offset = pageSize * (page - 1);

      if (type !== 'Demand') {
        type = 'Supply';
      }
      type = server.mysql.escape(type);

      let sql =
        'select trades.idtrade, trades.discordid, trades.type, trades.resource, trades.amount, trades.quality, trades.region, trades.price, users.nickname, users.discordtag from trades, users where trades.discordid=users.discordID';

      if (type) {
        sql += ` and trades.type like ${type}`;
      }

      if (resource) {
        sql += ` and trades.resource like ${resource}`;
      }

      if (region) {
        sql += ` and trades.region like ${region}`;
      }

      sql += ` LIMIT ${pageSize} OFFSET ${offset}`;

      server.mysql.query(sql, (err, result) => {
        if (result) {
          const tradeList: TradeInfo[] = result;
          return reply.code(200).send(tradeList);
        }
        if (err) {
          return reply.code(503);
        }
      });
    },
  );
};

export default routes;
