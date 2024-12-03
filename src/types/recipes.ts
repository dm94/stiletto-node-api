import { type Static, Type } from '@sinclair/typebox';

export const RecipeSchema = Type.Object({
  name: Type.String(),
  count: Type.Number(),
});

export type RecipeInfo = Static<typeof RecipeSchema>;

export const RecipeListSchema = Type.Object({
  token: Type.String(),
  items: Type.Array(RecipeSchema) || Type.Any() || Type.Unknown(),
});

export type RecipeListInfo = Static<typeof RecipeListSchema>;
