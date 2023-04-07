import { RequestGenericInterface } from 'fastify/types/request';

export interface GetDiscordServerRequest extends RequestGenericInterface {
  Params: {
    discordid: string;
  };
}
