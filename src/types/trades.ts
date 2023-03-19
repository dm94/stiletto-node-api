import { Static, Type } from '@sinclair/typebox';

enum TradeType {
  Supply = 'Supply',
  Demand = 'Demand',
}

export const TradeSchema = Type.Object({
  idtrade: Type.Number(),
  discordid: Type.String(),
  type: Type.Enum(TradeType),
  resource: Type.String(),
  amount: Type.Optional(Type.Number()) || Type.Null(),
  quality: Type.Optional(Type.Number()) || Type.Null(),
  region: Type.Optional(Type.String()) || Type.Null(),
  nickname: Type.Optional(Type.String()) || Type.Null(),
  discordtag: Type.String(),
  price: Type.Number(),
});

export type TradeInfo = Static<typeof TradeSchema>;
