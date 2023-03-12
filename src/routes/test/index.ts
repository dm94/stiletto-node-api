import { UserInfo, UserSchema } from '@customtypes/user';
import { FastifyPluginAsync } from 'fastify';

const routes: FastifyPluginAsync = async (server) => {
  server.get<{ Reply: UserInfo }>(
    '/',
    {
      onRequest: [server.authenticate],
      schema: {
        response: {
          200: UserSchema,
        },
      },
    },
    (request) => {
      return request.dbuser;
    },
  );
};

export default routes;
