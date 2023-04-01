import { ClanSchema } from '@customtypes/clans';
import { ClusterSchema } from '@customtypes/clusters';
import { TradeSchema } from '@customtypes/trades';
import { LoginSchema, UserSchema } from '@customtypes/user';
import { version, description, author, homepage, bugs, name } from '../../package.json';
import { MemberSchema } from '@customtypes/members';

export const schema = {
  openapi: {
    info: {
      title: name,
      description: description,
      version: version,
      contact: {
        name: author,
        url: bugs.url,
      },
    },
    externalDocs: {
      url: homepage,
    },
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
      { name: 'bot', description: 'Discord bot related end-points' },
      { name: 'clans' },
      { name: 'clusters' },
      { name: 'maps' },
      { name: 'recipes' },
      { name: 'tech' },
      { name: 'trades' },
      { name: 'users' },
      { name: 'walkers' },
    ],
    components: {
      securitySchemes: {
        apiKey: {
          type: 'apiKey',
          name: 'apiKey',
          in: 'header',
        },
        token: {
          type: 'http',
          scheme: 'bearer',
        },
      },
      schemas: { UserSchema, LoginSchema, ClanSchema, ClusterSchema, TradeSchema, MemberSchema },
    },
  },
  hideUntagged: true,
};
