import { Static, Type } from '@sinclair/typebox';

export enum Tree {
  VITAMINS = 'Vitamins',
  EQUIPMENT = 'Equipment',
  CONSTRUCTION = 'Construction',
  CRAFTING = 'Crafting',
  WALKERS = 'Walkers',
}

export const TechTreeSchema = Type.Object({
  discordtag: Type.String(),
  Vitamins: Type.Array(Type.String()),
  Equipment: Type.Array(Type.String()),
  Crafting: Type.Array(Type.String()),
  Construction: Type.Array(Type.String()),
  Walkers: Type.Array(Type.String()),
});

export type TechTreeInfo = Static<typeof TechTreeSchema>;

export const TechUserSchema = Type.Object({
  discordtag: Type.String(),
});

export type TechUserInfo = Static<typeof TechUserSchema>;
