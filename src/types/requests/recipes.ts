import { RequestGenericInterface } from 'fastify/types/request';

export interface GetRecipeRequest extends RequestGenericInterface {
  Params: {
    recipetoken: string;
  };
}
