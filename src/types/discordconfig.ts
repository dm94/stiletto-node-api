import { Static, Type } from '@sinclair/typebox';

export const DiscordConfigSchema = Type.Object({
  discordid: Type.String(),
  botLanguaje: Type.String(),
  readClanLog: Type.Boolean(),
  automaticKick: Type.Boolean(),
  setNotReadyPVP: Type.Boolean(),
  walkerAlarm: Type.Boolean(),
});

export type DiscordConfig = Static<typeof DiscordConfigSchema>;
