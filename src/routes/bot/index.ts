import { GetWhoHasLearnRequest } from '@customtypes/requests/bot';
import { TechUserInfo, TechUserSchema, Tree } from '@customtypes/techtree';
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
};

export default routes;
