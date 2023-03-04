import { getAccessToken, getUser } from '@services/DiscordAPI';

export const getLoginInfo = async (server, code: string, reply) => {
  const accessToken = await getAccessToken(code);
  const user = await getUser(accessToken);

  if (user) {
    const username = `${user.username}#${user.discriminator}`;
    const discordId = user.id;

    if (discordId) {
      return reply.code(202).send({
        discordid: discordId,
        token: username,
      });
    }

  }

  reply.code(401);
  return new Error('Discord code not valid');
};
