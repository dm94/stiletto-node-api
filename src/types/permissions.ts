import { Static, Type } from '@sinclair/typebox';

export enum Permission {
  REQUEST = 'request',
  KICK_MEMBERS = 'kickmembers',
  WALKERS = 'walkers',
  BOT = 'bot',
  DIPLOMACY = 'diplomacy',
}

export const PermissionsSchema = Type.Object({
  clanid: Type.Integer(),
  discordid: Type.String(),
  request: Type.Boolean(),
  kickmembers: Type.Boolean(),
  walkers: Type.Boolean(),
  bot: Type.Boolean(),
  diplomacy: Type.Boolean(),
});

export type Permissions = Static<typeof PermissionsSchema>;
