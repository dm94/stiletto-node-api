import { RelationshipInfo, RelationshipSchema } from '@customtypes/relationships';
import { GetClanRequest } from '@customtypes/requests/clans';
import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

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
        'SELECT clans.leaderid, diplomacy.id, diplomacy.typed, diplomacy.clanflag flagcolor, diplomacy.nameotherclan name, diplomacy.symbol FROM clans LEFT JOIN diplomacy on clans.clanid=diplomacy.idcreatorclan where clans.clanid=?',
        clanId,
        (err, result) => {
          if (result) {
            return reply.code(200).send(result as RelationshipInfo[]);
          } else if (err) {
            return reply.code(503).send();
          } else {
            return reply.code(404).send();
          }
        },
      );
    },
  );
};

export default routes;
