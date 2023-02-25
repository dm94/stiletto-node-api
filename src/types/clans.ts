import { Static, Type } from '@sinclair/typebox';

export const ClanInfo = Type.Object({
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

export type ClanInfoType = Static<typeof ClanInfo>;
