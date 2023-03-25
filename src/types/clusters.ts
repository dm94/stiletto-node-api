import { Static, Type } from '@sinclair/typebox';

export const ClusterInfoSchema = Type.Object({
  region: Type.String(),
  name: Type.String(),
  clan_limit: Type.Integer(),
  crossplay: Type.Boolean(),
});

export type ClusterInfo = Static<typeof ClusterInfoSchema>;
