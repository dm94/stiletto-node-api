import { Type } from '@sinclair/typebox';
import { FastifyPluginAsync } from 'fastify';

const routes: FastifyPluginAsync = async (server) => {
  server.get(
    '/',
    {
      onRequest: [server.authenticate],
      schema: {
        response: {
          200: Type.Object({
            hello: Type.String(),
          }),
        },
      },
    },
    async (request, reply) => {
      console.log('user', request.dbuser);

      return { hello: 'world' };
    },
  );
};

export default routes;
