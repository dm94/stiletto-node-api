import DiscordOauth2 from 'discord-oauth2';

export const getAccessToken = async (code: string) => {
  const oauth = new DiscordOauth2();

  try {
    return await oauth.tokenRequest({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      code: code,
      scope: 'identify guilds',
      grantType: 'authorization_code',
      redirectUri: process.env.DISCORD_REDIRECT_URL,
    });
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
