import type { FastifyPluginAsync } from 'fastify';
import type { AddRecipeRequest, GetRecipeRequest } from '@customtypes/requests/recipes';
import { type RecipeListInfo, RecipeListSchema } from '@customtypes/recipes';
import { Error400Default, Error404Default, Error503Default } from '@customtypes/errors';

const routes: FastifyPluginAsync = async (server) => {
  server.post<AddRecipeRequest, { Reply: RecipeListInfo }>(
    '/',
    {
      schema: {
        description: 'Add a list of recipes that can then be shared',
        summary: 'addRecipe',
        operationId: 'addRecipe',
        tags: ['recipes'],
        body: {
          type: 'object',
          required: ['items'],
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                required: ['name', 'count'],
                properties: {
                  name: { type: 'string' },
                  count: { type: 'integer' },
                },
              },
            },
          },
        },
        response: {
          201: RecipeListSchema,
          400: Error400Default,
          503: Error503Default,
        },
      },
    },
    async (request, reply) => {
      if (!request?.body?.items) {
        return reply.code(400).send();
      }

      const recipesCollection = server.mongo.client.db('lastoasis').collection('recipes');

      try {
        const search = await recipesCollection.findOne({ recipe: request.body.items });
        if (search) {
          return reply.code(201).send({
            token: search._id.toString(),
            items: search.recipe,
          });
        }
        const date = new Date().toISOString().split('T')[0];
        const result = await recipesCollection.insertOne({
          recipe: request.body.items,
          creation_date: date,
        });

        return reply.code(201).send({
          token: result.insertedId.toString(),
          items: request.body.items,
        });
      } catch (err) {
        console.log(err);
        return reply.code(503).send();
      }
    },
  );
  server.get<GetRecipeRequest, { Reply: RecipeListInfo }>(
    '/:recipetoken',
    {
      schema: {
        description: 'Returns an array with all the items of that recipe',
        summary: 'getRecipe',
        operationId: 'getRecipe',
        tags: ['recipes'],
        params: {
          type: 'object',
          properties: {
            recipetoken: { type: 'string' },
          },
        },
        response: {
          200: RecipeListSchema,
          400: Error400Default,
          404: Error404Default,
          503: Error503Default,
        },
      },
    },
    async (request, reply) => {
      if (!request?.params?.recipetoken) {
        return reply.code(400).send();
      }

      const recipes = server.mongo.client.db('lastoasis').collection('recipes');
      const id = new server.mongo.ObjectId(request.params.recipetoken);

      try {
        const recipe = await recipes.findOne({ _id: id });
        if (recipe?.recipe) {
          return reply.code(200).send({
            token: request.params.recipetoken,
            items: recipe.recipe,
          });
        }
        return reply.code(404).send();
      } catch (err) {
        console.log(err);
        return reply.code(503).send();
      }
    },
  );
};

export default routes;
