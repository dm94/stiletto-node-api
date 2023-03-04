import { Static, Type } from '@sinclair/typebox';

export const UserSchema = Type.Object({
  nickname: Type.Optional(Type.String()),
  discordtag: Type.String(),
  clanid: Type.Optional(Type.Integer()),
  clanname: Type.Optional(Type.String()),
  leaderid: Type.Optional(Type.String()),
  serverdiscord: Type.Optional(Type.String()),
});

export type UserInfo = Static<typeof UserSchema>;

export const LoginSchema = Type.Object({
  discordid: Type.String(),
  token: Type.String(),
});

export type LoginInfo = Static<typeof LoginSchema>;