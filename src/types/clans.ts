import { Static, Type } from '@sinclair/typebox';

export const ClanInfoSchema = Type.Object({
  clanid: Type.Number(),
  name: Type.String(),
  discordid: Type.Optional(Type.String()) || Type.Null(),
  leaderid: Type.String(),
  invitelink: Type.Optional(Type.String()) || Type.Null(),
  recruitment: Type.Boolean(),
  flagcolor: Type.Optional(Type.String()) || Type.Null(),
  symbol: Type.Optional(Type.String()) || Type.Null(),
  region: Type.String(),
  discordTag: Type.String(),
});

export type ClanInfo = Static<typeof ClanInfoSchema>;
