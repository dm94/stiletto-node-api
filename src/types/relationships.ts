import { type Static, Type } from '@sinclair/typebox';

export enum TypeRelationship {
  NAP = 0,
  ALLY = 1,
  WAR = 2,
  FALSE_NAP = 30,
  FALSE_ALLY = 31,
  FALSE_WAR = 32,
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
