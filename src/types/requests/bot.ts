import { Languages } from '@customtypes/discordconfig';
import { RequestGenericInterface } from 'fastify/types/request';

export interface GetDiscordServerRequest extends RequestGenericInterface {
  Params: {
    discordid: string;
  };
}

export interface UpdateBotConfigByServerRequest extends RequestGenericInterface {
  Querystring: {
    languaje?: Languages;
    clanlog?: boolean;
    kick?: boolean;
    readypvp?: boolean;
    walkeralarm?: boolean;
  };
  Params: {
    discordid: string;
  };
}
