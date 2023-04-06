import { FastifyPluginAsync } from 'fastify';
import { GetTechRequest } from '@customtypes/requests/users';
import { TechTreeInfo, TechTreeSchema } from '@customtypes/techtree';

const routes: FastifyPluginAsync = async (server) => {
  server.get<GetTechRequest, { Reply: TechTreeInfo }>(
    '/',
    {
      onRequest: [server.authenticate],
      schema: {
        description: 'Give back what you have learned from that technology tree.',
        summary: 'getLearned',
        operationId: 'getLearned',
        tags: ['users', 'tech'],
        params: {
          type: 'object',
          properties: {
            discordid: { type: 'string' },
          },
        },
        querystring: {
          type: 'object',
          required: [],
          properties: {
            tree: {
              type: 'string',
            },
          },
        },
        security: [
          {
            token: [],
          },
        ],
        response: {
          200: TechTreeSchema,
        },
      },
    },
    async (request, reply) => {
      if (!request?.params?.discordid) {
        return reply.code(400).send();
      }

      if (!request?.dbuser) {
        reply.code(401);
        return new Error('Invalid token JWT');
      }

      const tech = server.mongo.client.db('lastoasis').collection('tech');

      try {
        const techTree = await tech.findOne({ discordtag: request.dbuser.discordtag });
        if (techTree) {
          return reply.code(200).send(techTree);
        } else {
          return reply.code(404).send();
        }
      } catch (err) {
        console.log(err);
        return reply.code(503).send();
      }
    },
  );
  server.put<GetTechRequest, { Reply: TechTreeInfo }>(
    '/',
    {
      onRequest: [server.authenticate],
      schema: {
        description: 'Adds the list of learned technologies to that user.',
        summary: 'addTech',
        operationId: 'addTech',
        tags: ['users', 'tech'],
        params: {
          type: 'object',
          properties: {
            discordid: { type: 'string' },
          },
        },
        querystring: {
          type: 'object',
          required: ['tree'],
          properties: {
            tree: {
              type: 'string',
            },
          },
        },
        security: [
          {
            token: [],
          },
        ],
        response: {
          200: TechTreeSchema,
        },
      },
    },
    async (request, reply) => {
      if (!request?.params?.discordid || !request?.body) {
        return reply.code(400).send();
      }

      if (!request?.dbuser) {
        reply.code(401);
        return new Error('Invalid token JWT');
      }
      const tree: string = request.query?.tree ? request.query.tree : 'Vitamins';
      const tech = server.mongo.client.db('lastoasis').collection('tech');

      try {
        await tech.updateOne(
          { discordtag: request.dbuser.discordtag },
          { $set: { [tree]: request.body } },
        );
        const techTree = await tech.findOne({ discordtag: request.dbuser.discordtag });
        if (techTree) {
          return reply.code(200).send(techTree);
        } else {
          return reply.code(201).send();
        }
      } catch (err) {
        console.log(err);
        return reply.code(503).send();
      }
    },
  );
};

export default routes;
