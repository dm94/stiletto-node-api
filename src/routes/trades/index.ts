import type { FastifyPluginAsync } from 'fastify';
import { type TradeInfo, TradeSchema, TradeType } from '@customtypes/trades';
import { Type } from '@sinclair/typebox';
import type {
  DeleteTradeRequest,
  CreateTradeRequest,
  GetTradesRequest,
} from '@customtypes/requests/trades';
import { Error400Default, Error401Default, Error503Default } from '@customtypes/errors';

const routes: FastifyPluginAsync = async (server) => {
  server.get<GetTradesRequest, { Reply: TradeInfo[] }>(
    '/',
    {
      schema: {
        description: 'Returns the trades',
        summary: 'getTrades',
        operationId: 'getTrades',
        tags: ['trades'],
        querystring: {
          type: 'object',
          required: [],
          properties: {
            pageSize: {
              type: 'integer',
              default: 10,
              minimum: 1,
              maximum: 100,
            },
            page: {
              type: 'integer',
              default: 1,
              minimum: 1,
            },
            type: {
              type: 'string',
              description: 'Type of trade',
              enum: Object.values(TradeType),
            },
            resource: {
              type: 'string',
              description: 'Type of resource. Example Aloe',
            },
            region: {
              type: 'string',
              description: 'Region of the trade. EU, NA, SA , ASIA, OCE',
            },
          },
        },
        response: {
          200: Type.Array(TradeSchema),
          503: Error503Default,
        },
      },
    },
    (request, reply) => {
      let pageSize: number =
        request.query?.pageSize && request.query?.pageSize > 0 ? request.query.pageSize : 10;
      let page: number = request.query?.page && request.query.page > 0 ? request.query.page : 1;
      let type: string | undefined = request.query?.type ? request.query.type : undefined;
      const resource: string | undefined = request.query?.resource
        ? server.mysql.escape(request.query.resource)
        : undefined;
      const region: string | undefined = request.query?.region
        ? server.mysql.escape(request.query.region)
        : undefined;

      if (pageSize < 1) {
        pageSize = 1;
      }
      if (page < 1) {
        page = 1;
      }

      const offset = pageSize * (page - 1);

      if (type) {
        if (type !== 'Demand') {
          type = 'Supply';
        }
        type = server.mysql.escape(type);
      }

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
          return reply.code(200).send(result);
        }
        if (err) {
          return reply.code(503).send();
        }
      });
    },
  );
  server.post<CreateTradeRequest>(
    '/',
    {
      onRequest: [server.authenticate],
      schema: {
        description: 'For add a trade',
        summary: 'createTrade',
        operationId: 'createTrade',
        tags: ['trades'],
        querystring: {
          type: 'object',
          required: ['type', 'resource', 'region', 'price'],
          properties: {
            type: {
              type: 'string',
              description: 'Type of trade',
              enum: Object.values(TradeType),
            },
            resource: {
              type: 'string',
              description: 'Type of resource. Example Aloe',
            },
            amount: {
              type: 'integer',
              description: 'Amount of the resource',
            },
            quality: {
              type: 'integer',
              description: 'Quality of the resource. Max 100',
            },
            region: {
              type: 'string',
              description: 'Region of the trade. EU, NA, SA , ASIA, OCE',
            },
            price: {
              type: 'integer',
              description: 'Price per resource',
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
          401: Error401Default,
          503: Error503Default,
        },
      },
    },
    (request, reply) => {
      let type: string = request.query?.type ?? TradeType.Supply;
      const resource: string = request.query?.resource ?? 'Aloe';
      let amount: number =
        request.query?.amount && request.query.amount > 0 ? request.query.amount : 1;
      let quality: number =
        request.query?.quality && request.query.quality > 0 ? request.query.quality : 0;
      let region: string | undefined = request.query?.region ?? undefined;
      let price: number = request.query?.price && request.query.price > 0 ? request.query.price : 0;

      if (type !== 'Demand') {
        type = 'Supply';
      }

      if (request.dbuser && resource.length < 100) {
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

        if (amount < 0) {
          amount = 0;
        }
        if (quality < 0) {
          quality = 0;
        }
        if (quality > 100) {
          quality = 100;
        }
        if (price < 0) {
          price = 0;
        }

        const discordId = String(request.dbuser.discordid);

        server.mysql.query(
          'insert into trades(discordid,type,resource,amount,quality,region,price) values(?,?,?,?,?,?,?)',
          [discordId, type, resource, amount, quality, region, price],
          (err, result) => {
            if (result) {
              return reply.code(201).send({
                message: 'Trade created',
              });
            }
            if (err) {
              return reply.code(503).send();
            }
          },
        );
      } else {
        reply.code(401);
        return new Error('Invalid token JWT');
      }
    },
  );
  server.delete<DeleteTradeRequest>(
    '/:tradeId',
    {
      onRequest: [server.authenticate],
      schema: {
        description: 'Delete the trade',
        summary: 'deleteTrade',
        operationId: 'deleteTrade',
        tags: ['trades'],
        params: {
          type: 'object',
          properties: {
            tradeId: { type: 'integer' },
          },
        },
        security: [
          {
            token: [],
          },
        ],
        response: {
          204: Type.Object({
            message: Type.String(),
          }),
          400: Error400Default,
          503: Error503Default,
        },
      },
    },
    (request, reply) => {
      if (request?.params?.tradeId) {
        if (request.dbuser) {
          const tradeId = Number(request.params.tradeId);
          const discordId = String(request.dbuser.discordid);
          server.mysql.query(
            'delete from trades where idtrade=? and discordid=?',
            [tradeId, discordId],
            (err, result) => {
              if (result) {
                return reply.code(204).send();
              }
              if (err) {
                return reply.code(503).send();
              }
            },
          );
        } else {
          reply.code(401);
          return new Error('Invalid token JWT');
        }
      } else {
        return reply.code(400).send();
      }
    },
  );
};

export default routes;
