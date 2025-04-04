import type { FastifyPluginAsync } from 'fastify';
import type { GetTechRequest } from '@customtypes/requests/users';
import { type TechTreeInfo, TechTreeSchema, Tree } from '@customtypes/techtree';
import {
  Error400Default,
  Error401Default,
  Error404Default,
  Error503Default,
} from '@customtypes/errors';

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
          200: TechTreeSchema,
          400: Error400Default,
          401: Error401Default,
          404: Error404Default,
          503: Error503Default,
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
        }
        return reply.code(404).send();
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
              description: 'Tree name',
              enum: Object.values(Tree),
            },
          },
        },
        body: {
          type: 'array',
          items: {
            type: 'string',
            description: 'Tech name',
          },
        },
        security: [
          {
            token: [],
          },
        ],
        response: {
          200: TechTreeSchema,
          400: Error400Default,
          401: Error401Default,
          503: Error503Default,
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
        const techTree = await tech.findOne({ discordtag: request.dbuser.discordtag });
        if (techTree) {
          await tech.updateOne(
            { discordtag: request.dbuser.discordtag },
            { $set: { [tree]: request.body } },
          );
          return reply.code(200).send(techTree);
        } else {
          await tech.insertOne(
            { discordtag: request.dbuser.discordtag,
              [tree]: request.body
            },
          );
        }
        
        return reply.code(201).send();
      } catch (err) {
        console.log(err);
        return reply.code(503).send();
      }
    },
  );
};

export default routes;
