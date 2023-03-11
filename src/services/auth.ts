import { getAccessToken, getUser } from '@services/DiscordAPI';

export const getLoginInfo = async (server, request, reply) => {
  const accessToken = await getAccessToken(request.query.code);

  if (accessToken && accessToken.access_token) {
    const user = await getUser(accessToken.access_token);

    if (user) {
      const username = `${user.username}#${user.discriminator}`;
      const discordId = user.id;

      if (discordId) {
        let token: undefined | string = undefined;
        server.mysql.query(
          'select users.nickname, users.discordtag, users.discordID discordid, users.clanid, users.token from users where users.discordID=?',
          discordId,
          (err, result) => {
            if (result && result[0].token) {
              token = result[0].token;
            }
          },
        );

        if (token) {
          try {
            await server.jwt.verify(token, (err) => {
              if (err) {
                console.log('The token is malformed.', discordId);
              }
              return reply.code(202).send({
                discordid: discordId,
                discordTag: username,
                token: token,
              });
            });
          } catch (e) {
            console.log('The token is malformed.', discordId);
          }
        }
        token = await server.jwt.sign({ discordid: discordId }, { expiresIn: '30d' });

        const date = new Date().toISOString().split('T')[0];

        server.mysql.getConnection((err, client) => {
          if (err) return reply.send(err);

          client.query(
            'INSERT INTO users(discordID, discordTag,token,createdAt) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE token=?, lastUpdate=?',
            [discordId, username, token, date, token, date],
            function onResult() {
              return reply.code(202).send({
                discordid: discordId,
                discordTag: username,
                token: token,
              });
            },
          );
        });

        return reply.code(202).send({
          discordid: discordId,
          discordTag: username,
          token: token,
        });
      }
    }
  }

  reply.code(401);
  return new Error('Discord code not valid');
};
