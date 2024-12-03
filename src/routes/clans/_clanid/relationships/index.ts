import {
  Error400Default,
  Error401Default,
  Error405Default,
  Error503Default,
} from '@customtypes/errors';
import { Permission } from '@customtypes/permissions';
import {
  type RelationshipInfo,
  RelationshipSchema,
  TypeRelationship,
} from '@customtypes/relationships';
import type { GetClanRequest } from '@customtypes/requests/clans';
import type { CreateRelationshipRequest } from '@customtypes/requests/relationships';
import { addPermissions } from '@services/permission';
import { Type } from '@sinclair/typebox';
import type { FastifyPluginAsync } from 'fastify';

const routes: FastifyPluginAsync = async (server) => {
  server.get<GetClanRequest, { Reply: RelationshipInfo[] }>(
    '/',
    {
      onRequest: [server.authenticate],
      schema: {
        description: 'Return the list of relationships for the clan',
        summary: 'getRelationships',
        operationId: 'getRelationships',
        tags: ['clans'],
        params: {
          type: 'object',
          properties: {
            clanid: { type: 'integer' },
          },
        },
        security: [
          {
            token: [],
          },
        ],
        response: {
          200: Type.Array(RelationshipSchema),
          400: Error400Default,
          401: Error401Default,
          503: Error503Default,
        },
      },
    },
    (request, reply) => {
      if (!request?.dbuser) {
        reply.code(401);
        return new Error('Invalid token JWT');
      }

      if (Number(request.dbuser.clanid) !== Number(request.params.clanid)) {
        reply.code(401);
        return new Error('You are not a member of this clan');
      }

      if (!request.params?.clanid) {
        return reply.code(400).send();
      }

      const clanId = Number(request.params.clanid);
      server.mysql.query(
        'SELECT clans.leaderid, diplomacy.id, diplomacy.typed, diplomacy.clanflag as flagcolor, diplomacy.nameotherclan as name, diplomacy.symbol FROM clans JOIN diplomacy on clans.clanid=diplomacy.idcreatorclan where clans.clanid=?',
        clanId,
        (err, result) => {
          if (result) {
            return reply.code(200).send(result as RelationshipInfo[]);
          }
          if (err) {
            return reply.code(503).send();
          }
        },
      );
    },
  );
  server.post<CreateRelationshipRequest>(
    '/',
    {
      onRequest: [
        server.authenticate,
        (request, _reply, done) => addPermissions(server, request, done),
      ],
      schema: {
        description: 'To create new relationships',
        summary: 'createRelationship',
        operationId: 'createRelationship',
        tags: ['clans'],
        params: {
          type: 'object',
          properties: {
            clanid: { type: 'integer' },
          },
        },
        querystring: {
          type: 'object',
          required: ['typed', 'nameotherclan'],
          properties: {
            typed: {
              type: 'integer',
              description:
                'Type of relationship. 0 PNA, 1 Ally, 2 Enemy, 30 False PNA, 31 False Ally, 32 False War',
              enum: Object.values(TypeRelationship),
            },
            clanflag: {
              type: 'string',
              description: 'Shows the colour of the clan in hexadecimal',
            },
            nameotherclan: {
              type: 'string',
              description: 'Clan name',
            },
            symbol: {
              type: 'string',
              description: 'Image of the flag',
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
          400: Error400Default,
          401: Error401Default,
          405: Error405Default,
          503: Error503Default,
        },
      },
    },
    (request, reply) => {
      if (!request?.dbuser) {
        reply.code(401);
        return new Error('Invalid token JWT');
      }

      if (Number(request.dbuser.clanid) !== Number(request.params.clanid)) {
        reply.code(401);
        return new Error('You are not a member of this clan');
      }

      if (!request.params?.clanid) {
        return reply.code(400).send();
      }

      if (
        request?.dbuser.discordid !== request?.dbuser.leaderid &&
        (!request?.clanPermissions || !request.clanPermissions[Permission.DIPLOMACY])
      ) {
        reply.code(401);
        return new Error('You do not have permissions to perform this action');
      }

      const clanId = Number(request.params.clanid);
      const typed: number | TypeRelationship = request.query?.typed;
      const clanflag: string = request.query?.clanflag ?? '#000000';
      const nameotherclan: string = request.query?.nameotherclan;
      const symbol: string = request.query?.symbol ?? 'C1';

      server.mysql.query(
        'insert into diplomacy(idcreatorclan,typed,clanflag,nameotherclan,symbol) values(?,?,?,?,?)',
        [clanId, typed, clanflag, nameotherclan, symbol],
        (err, result) => {
          if (result) {
            return reply.code(201).send({
              message: 'The relationship of diplomacy has been created',
            });
          }
          if (err) {
            return reply.code(503).send();
          }
          return reply.code(405).send();
        },
      );
    },
  );
};

export default routes;
