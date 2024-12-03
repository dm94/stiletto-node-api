import { type Static, Type } from '@sinclair/typebox';

export const MapSchema = Type.Object({
  mapid: Type.Number(),
  typemap: Type.String(),
  discordid: Type.String(),
  name: Type.String(),
  dateofburning: Type.Optional(Type.String()) || Type.Null(),
  pass: Type.Optional(Type.String()) || Type.Null(),
  allowedit: Type.Boolean(),
});

export type MapInfo = Static<typeof MapSchema>;
