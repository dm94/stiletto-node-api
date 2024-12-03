import { type Static, Type } from '@sinclair/typebox';

export enum MemberActions {
  OWNER = 'owner',
  KICK = 'kick',
}

export const MemberSchema = Type.Object({
  discordid: Type.String(),
  nickname: Type.Optional(Type.String()) || Type.Null(),
  discordtag: Type.String(),
  leaderid: Type.String(),
});

export type MemberInfo = Static<typeof MemberSchema>;
