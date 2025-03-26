import { type Static, Type } from '@sinclair/typebox';

export const ResourceSchema = Type.Object({
  resourceid: Type.Number(),
  mapid: Type.Number(),
  resourcetype: Type.String(),
  quality: Type.Number(),
  x: Type.Number(),
  y: Type.Number(),
  token: Type.String(),
  typemap: Type.String(),
  description: Type.Optional(Type.String()),
  lastharvested: Type.Optional(Type.String()),
});

export type ResourceInfo = Static<typeof ResourceSchema>;
