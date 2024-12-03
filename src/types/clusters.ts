import { type Static, Type } from '@sinclair/typebox';

export const ClusterSchema = Type.Object({
  region: Type.String(),
  name: Type.String(),
  clan_limit: Type.Integer(),
  crossplay: Type.Boolean(),
});

export type ClusterInfo = Static<typeof ClusterSchema>;
