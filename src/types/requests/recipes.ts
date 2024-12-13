import type { RequestGenericInterface } from 'fastify/types/request';

export interface GetRecipeRequest extends RequestGenericInterface {
  Params: {
    recipetoken: string;
  };
}

type Recipe = {
  name: string;
  count: number;
};

export interface AddRecipeRequest extends RequestGenericInterface {
  Body: {
    items: Recipe[];
  };
}
