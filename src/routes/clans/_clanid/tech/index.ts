import { FastifyPluginAsync } from 'fastify';
import { TechUserInfo, TechUserSchema, Tree } from '@customtypes/techtree';
import { SeeWhoHasLearntItRequest } from '@customtypes/requests/clans';
import { Type } from '@sinclair/typebox';

const routes: FastifyPluginAsync = async (server) => {
  server.get<SeeWhoHasLearntItRequest, { Reply: TechUserInfo[] }>(
    '/',
    {
      onRequest: [server.authenticate],
      schema: {
        description: 'Returns all clan members who have learned that technology',
        summary: 'seeWhoHasLearntIt',
        operationId: 'seeWhoHasLearntIt',
        tags: ['clans', 'tech'],
        params: {
          type: 'object',
          properties: {
            clanid: { type: 'string' },
          },
        },
        querystring: {
          type: 'object',
          required: ['tree', 'tech'],
          properties: {
            tech: {
              type: 'string',
            },
            tree: {
              type: 'string',
              enum: Object.values(Tree),
            },
          },
        },
        security: [
          {
            token: [],
          },
        ],
        response: {
          200: Type.Array(TechUserSchema),
        },
      },
    },
    (request, reply) => {
      if (!request?.params?.clanid) {
        return reply.code(400).send();
      }

      if (!request?.dbuser || !request?.dbuser.clanid) {
        reply.code(401);
        return new Error('Invalid token JWT');
      }

      const tree: string = request.query?.tree ? request.query.tree : 'Vitamins';
      const tech: string = request.query?.tech ? request.query.tech : 'Desert Mule';

      const allUsers: string[] = [];
      const clanId = Number(request.dbuser.clanid);
      try {
        server.mysql.query('select discordTag from users where clanid=?', [clanId], (err, rows) => {
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
        });
      } catch (err) {
        console.log(err);
        return reply.code(503).send();
      }
    },
  );
};

export default routes;
