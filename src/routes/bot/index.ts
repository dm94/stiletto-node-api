import {
  Error400Default,
  Error401Default,
  Error404Default,
  Error503Default,
} from '@customtypes/errors';
import { CreateTradefromBotRequest, GetWhoHasLearnRequest } from '@customtypes/requests/bot';
import {
  TechTreeInfo,
  TechTreeSchema,
  TechUserInfo,
  TechUserSchema,
  Tree,
} from '@customtypes/techtree';
import { TradeType } from '@customtypes/trades';
import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

const routes: FastifyPluginAsync = async (server) => {
  server.get<GetWhoHasLearnRequest, { Reply: TechUserInfo[] }>(
    '/:discordid/tech',
    {
      onRequest: [server.botAuth],
      schema: {
        description: 'Give who in your clan has learned something',
        summary: 'getWhoHasLearn',
        operationId: 'getWhoHasLearn',
        tags: ['bot', 'tech'],
        params: {
          type: 'object',
          properties: {
            discordid: { type: 'string' },
          },
        },
        querystring: {
          type: 'object',
          required: ['tree', 'tech'],
          properties: {
            tech: {
              type: 'string',
              description: 'Item name',
            },
            tree: {
              type: 'string',
              enum: Object.values(Tree),
              description: 'Technology tree of the item',
            },
          },
        },
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: Type.Array(TechUserSchema),
          400: Error400Default,
          401: Error401Default,
          503: Error503Default,
        },
      },
    },
    (request, reply) => {
      if (!request?.params?.discordid) {
        return reply.code(400).send();
      }

      const tree: string = request.query?.tree ? request.query.tree : 'Vitamins';
      const tech: string = request.query?.tech ? request.query.tech : 'Desert Mule';

      const allUsers: string[] = [];
      try {
        server.mysql.query(
          'select users.discordTag discordTag from users,clans where users.clanid=clans.clanid and clans.discordid=?',
          [request.params.discordid],
          (err, rows) => {
            if (rows) {
              //@ts-ignore
              rows.forEach((row) => {
                allUsers.push(row.discordTag);
              });
              const techCollection = server.mongo.client.db('lastoasis').collection('tech');
              techCollection
                .find(
                  {
                    discordtag: { $in: allUsers },
                    [tree]: tech,
                  },
                  { projection: { _id: 0, discordtag: 1 } },
                )
                .toArray()
                .then((result) => {
                  return reply.code(200).send(result);
                });
            }
            if (err) {
              return reply.code(503).send();
            }
          },
        );
      } catch (err) {
        console.log(err);
        return reply.code(503).send();
      }
    },
  );
  server.post<GetWhoHasLearnRequest, { Reply: TechTreeInfo }>(
    '/:discordid/tech',
    {
      onRequest: [server.botAuth],
      schema: {
        description: 'Adds the list of learned technologies to that user.',
        summary: 'addTechByBot',
        operationId: 'addTechByBot',
        tags: ['bot', 'tech'],
        params: {
          type: 'object',
          properties: {
            discordid: { type: 'string' },
          },
        },
        querystring: {
          type: 'object',
          required: ['tree', 'tech'],
          properties: {
            tech: {
              type: 'string',
              description: 'Item name',
            },
            tree: {
              type: 'string',
              enum: Object.values(Tree),
              description: 'Technology tree of the item',
            },
          },
        },
        security: [
          {
            apiKey: [],
          },
        ],
        response: {
          200: TechTreeSchema,
          400: Error400Default,
          401: Error401Default,
          404: Error404Default,
          503: Error503Default,
        },
      },
    },
    (request, reply) => {
      if (!request?.params?.discordid) {
        return reply.code(400).send();
      }

      const tree: string = request.query?.tree ? request.query.tree : 'Vitamins';
      const tech: string = request.query?.tech ? request.query.tech : 'Desert Mule';

      try {
        server.mysql.query(
          'select discordTag from users where discordID=?',
          [request.params.discordid],
          (e, rows) => {
            if (rows && rows[0] && rows[0].discordTag) {
              const discordtag = rows[0].discordTag;

              const techCollection = server.mongo.client.db('lastoasis').collection('tech');
              techCollection
                .updateOne(
                  { discordtag: discordtag },
                  { $addToSet: { [tree]: tech } },
                  { upsert: true },
                )
                .then(() => {
                  techCollection.findOne({ discordtag: discordtag }).then((techTree) => {
                    if (techTree) {
                      return reply.code(200).send(techTree);
                    } else {
                      return reply.code(201).send();
                    }
                  });
                });
            } else if (e) {
              return reply.code(503).send();
            } else {
              return reply.code(404).send();
            }
          },
        );
      } catch (err) {
        console.log(err);
        return reply.code(503).send();
      }
    },
  );
  server.post<CreateTradefromBotRequest, { Reply: TechTreeInfo }>(
    '/trades',
    {
      onRequest: [server.botAuth],
      schema: {
        description: 'For add a trade from bot',
        summary: 'createTradefromBot',
        operationId: 'createTradefromBot',
        tags: ['bot', 'tech'],
        querystring: {
          type: 'object',
          required: ['discordid', 'type', 'resource', 'region', 'price'],
          properties: {
            discordid: {
              type: 'string',
              description: 'User Discord ID',
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
            apiKey: [],
          },
        ],
        response: {
          201: Type.Object({
            message: Type.String(),
          }),
          400: Error400Default,
          401: Error401Default,
          503: Error503Default,
        },
      },
    },
    (request, reply) => {
      const discordid: string = request.query.discordid;
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

        server.mysql.query(
          'insert into trades(discordid,type,resource,amount,quality,region,price) values(?,?,?,?,?,?,?)',
          [discordid, type, resource, amount, quality, region, price],
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
};

export default routes;
