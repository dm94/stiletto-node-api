import { Static, Type } from '@sinclair/typebox';

export const UserSchema = Type.Object({
  nickname: Type.Optional(Type.String()) || Type.Null(),
  discordtag: Type.String(),
  discordid: Type.String(),
  clanid: Type.Optional(Type.Integer()) || Type.Null(),
  clanname: Type.Optional(Type.String()) || Type.Null(),
  leaderid: Type.Optional(Type.String()) || Type.Null(),
  serverdiscord: Type.Optional(Type.String()) || Type.Null(),
});

export type UserInfo = Static<typeof UserSchema>;

export const LoginSchema = Type.Object({
  discordid: Type.String(),
  token: Type.String(),
});

export type LoginInfo = Static<typeof LoginSchema>;
