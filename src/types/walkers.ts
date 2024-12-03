import { type Static, Type } from '@sinclair/typebox';

export enum WalkerUse {
  PVP = 'pvp',
  FARMING = 'farming',
  PERSONAL = 'personal',
  RAM = 'ram',
}

export enum WalkerType {
  BUFFALO = 'Buffalo',
  CAMELOP = 'Camelop',
  COBRA = 'Cobra',
  DINGHY = 'Dinghy',
  DOMUS = 'Domus',
  FALCO = 'Falco',
  FIREFLY = 'Firefly',
  HORNET = 'Hornet',
  MOLLUSK = 'Mollusk',
  PANDA = 'Panda',
  PROXY = 'Proxy',
  SCHMETTERLING = 'Schmetterling',
  NOMAD_SPIDER = 'Nomad Spider',
  STILETTO = 'Stiletto',
  TITAN = 'Titan',
  TOBOGGAN = 'Toboggan',
  TUSKER = 'Tusker',
  SILUR = 'Silur',
  HERCUL = 'Hercul',
  BALANG = 'Balang',
  RAPTOR_SKY = 'Raptor Sky',
}

export const WalkerSchema = Type.Object({
  leaderid: Type.Optional(Type.String()),
  discordid: Type.String(),
  walkerid: Type.Number(),
  name: Type.String(),
  ownerUser: Type.Optional(Type.String()) || Type.Null(),
  lastuser: Type.Optional(Type.String()) || Type.Null(),
  datelastuse: Type.Optional(Type.String()) || Type.Null(),
  type: Type.Optional(Type.String() || Type.Enum(WalkerType) || Type.Null()),
  use: Type.Optional(Type.String() || Type.Enum(WalkerUse) || Type.Null()),
  isReady: Type.Boolean(),
  description: Type.Optional(Type.String()) || Type.Null(),
});

export type WalkerInfo = Static<typeof WalkerSchema>;
