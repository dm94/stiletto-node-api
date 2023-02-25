export const schema = {
  openapi: {
    info: {
      title: 'Stiletto API',
      description: 'API for [Stiletto Web](https://github.com/dm94/stiletto-web)',
      version: '3.0.0',
    },
    externalDocs: {
      url: 'https://bump.sh/doc/stiletto-api',
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
    securityDefinitions: {
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
  },
};
