import { Static, Type } from '@sinclair/typebox';

export enum Languages {
  EN = 'en',
  ES = 'es',
  RU = 'ru',
  FR = 'fr',
  DE = 'de',
}

export const DiscordConfigSchema = Type.Object({
  discordid: Type.String(),
  botLanguaje: Type.Enum(Languages),
  readClanLog: Type.Boolean(),
  automaticKick: Type.Boolean(),
  setNotReadyPVP: Type.Boolean(),
  walkerAlarm: Type.Boolean(),
});

export type DiscordConfig = Static<typeof DiscordConfigSchema>;
