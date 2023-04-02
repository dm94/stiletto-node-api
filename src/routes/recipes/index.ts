import { FastifyPluginAsync } from 'fastify';
import { GetRecipeRequest } from '@customtypes/requests/recipes';
import { RecipeListInfo, RecipeListSchema } from '@customtypes/recipes';

const routes: FastifyPluginAsync = async (server) => {
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
            items: JSON.parse(recipe.recipe),
          });
        } else {
          return reply.code(404).send();
        }
      } catch (err) {
        console.log(err);
        return reply.code(503).send();
      }
    },
  );
};

export default routes;
