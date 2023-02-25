import { Static, Type } from '@sinclair/typebox';

export const ClanInfoSchema = Type.Object({
  clanid: Type.String(),
  name: Type.String(),
  discordid: Type.Optional(Type.String()),
  leaderid: Type.String(),
  invitelink: Type.Optional(Type.String()),
  recruitment: Type.Boolean(),
  flagcolor: Type.String(),
  symbol: Type.String(),
  region: Type.String(),
  discordTag: Type.String(),
});

export type ClanInfo = Static<typeof ClanInfoSchema>;
