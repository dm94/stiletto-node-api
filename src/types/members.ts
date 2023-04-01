import { Static, Type } from '@sinclair/typebox';

export const MemberSchema = Type.Object({
  discordid: Type.String(),
  nickname: Type.Optional(Type.String()) || Type.Null(),
  discordtag: Type.String(),
  leaderid: Type.String(),
});

export type MemberInfo = Static<typeof MemberSchema>;
