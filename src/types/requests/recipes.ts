import { RequestGenericInterface } from 'fastify/types/request';

export interface GetRecipeRequest extends RequestGenericInterface {
  Params: {
    recipetoken: string;
  };
}

export interface AddRecipeRequest extends RequestGenericInterface {
  Querystring: {
    items: string;
  };
}
