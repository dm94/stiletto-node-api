import type {
  MySQLConnection,
  MySQLPool,
  MySQLPromiseConnection,
  MySQLPromisePool,
} from '@fastify/mysql';

declare module 'fastify' {
  interface FastifyInstance {
    mysql: MySQLPool;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    mysql: MySQLConnection;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    mysql: MySQLPromisePool;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    mysql: MySQLPromiseConnection;
  }
}
