import { Static, Type } from '@sinclair/typebox';

export enum WalkerUse {
  PVP = 'pvp',
  FARMING = 'farming',
  PERSONAL = 'personal',
  RAM = 'ram',
}

export const WalkerSchema = Type.Object({
  leaderid: Type.String(),
  discordid: Type.String(),
  walkerid: Type.Number(),
  name: Type.String(),
  ownerUser: Type.Optional(Type.String()) || Type.Null(),
  lastuser: Type.Optional(Type.String()) || Type.Null(),
  datelastuse: Type.Optional(Type.String()) || Type.Null(),
  type: Type.Optional(Type.String()) || Type.Null(),
  use: Type.Enum(WalkerUse),
  isReady: Type.Boolean(),
  description: Type.Optional(Type.String()) || Type.Null(),
});

export type WalkerInfo = Static<typeof WalkerSchema>;
