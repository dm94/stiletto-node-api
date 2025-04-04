import { type Static, Type } from '@sinclair/typebox';

export enum Tree {
  VITAMINS = 'Vitamins',
  EQUIPMENT = 'Equipment',
  CONSTRUCTION = 'Construction',
  CRAFTING = 'Crafting',
  WALKERS = 'Walkers',
}

export const TechTreeSchema = Type.Object({
  discordtag: Type.String(),
  Vitamins: Type.Optional(Type.Array(Type.String())),
  Equipment: Type.Optional(Type.Array(Type.String())),
  Crafting: Type.Optional(Type.Array(Type.String())),
  Construction: Type.Optional(Type.Array(Type.String())),
  Walkers: Type.Optional(Type.Array(Type.String())),
});

export type TechTreeInfo = Static<typeof TechTreeSchema>;

export const TechUserSchema = Type.Object({
  discordtag: Type.String(),
});

export type TechUserInfo = Static<typeof TechUserSchema>;
