import { Static, Type } from '@sinclair/typebox';

export const MemberRequestSchema = Type.Object({
  discordid: Type.String(),
  nickname: Type.Optional(Type.String()) || Type.Null(),
  discordtag: Type.String(),
  leaderid: Type.String(),
  message: Type.Optional(Type.String()) || Type.Null(),
});

export type MemberRequest = Static<typeof MemberRequestSchema>;
