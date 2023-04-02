import DiscordOauth2 from 'discord-oauth2';

export const getAccessToken = async (code: string, extra?: object) => {
  const oauth = new DiscordOauth2();

  let data = {
    clientId: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    code: code,
    scope: 'identify guilds',
    grantType: 'authorization_code',
    redirectUri: process.env.DISCORD_REDIRECT_URL,
  };

  if (extra !== undefined) {
    data = {
      ...data,
      ...extra,
    };
  }

  try {
    //@ts-ignore
    return await oauth.tokenRequest(data);
  } catch (e) {
    return null;
  }
};

export const getUser = async (accessToken: string) => {
  const oauth = new DiscordOauth2();

  try {
    return await oauth.getUser(accessToken);
  } catch (e) {
    return null;
  }
};

export const getGuilds = async (accessToken: string) => {
  const oauth = new DiscordOauth2();

  try {
    return await oauth.getUserGuilds(accessToken);
  } catch (e) {
    return null;
  }
};
