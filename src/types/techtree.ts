import { Static, Type } from '@sinclair/typebox';

export const TechTreeSchema = Type.Object({
  discordtag: Type.String(),
  Vitamins: Type.Array(Type.String()),
  Equipment: Type.Array(Type.String()),
  Crafting: Type.Array(Type.String()),
  Construction: Type.Array(Type.String()),
  Walkers: Type.Array(Type.String()),
});

export type TechTreeInfo = Static<typeof TechTreeSchema>;
