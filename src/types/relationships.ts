import { Static, Type } from '@sinclair/typebox';

export enum TypeRelationship {
  NAP = 0,
  ALLIE = 1,
  ENEMY = 2,
}

export const RelationshipSchema = Type.Object({
  leaderid: Type.String(),
  id: Type.Integer(),
  typed: Type.Integer(TypeRelationship),
  flagcolor: Type.String(),
  name: Type.String(),
  symbol: Type.String(),
});

export type RelationshipInfo = Static<typeof RelationshipSchema>;
