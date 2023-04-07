import {
  Error400Default,
  Error401Default,
  Error404Default,
  Error503Default,
} from '@customtypes/errors';
import { GetWhoHasLearnRequest } from '@customtypes/requests/bot';
import {
  TechTreeInfo,
  TechTreeSchema,
  TechUserInfo,
  TechUserSchema,
  Tree,
} from '@customtypes/techtree';
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
};

export default routes;
