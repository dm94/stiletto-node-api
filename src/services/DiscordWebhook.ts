import axios from 'axios';

export const sendDiscordMessage = (message: string) => {
  if (process.env.DISCORD_WEBHOOK) {
    axios
      .request({
        url: process.env.DISCORD_WEBHOOK,
        method: 'post',
        headers: {
          'Content-type': 'application/json',
        },
        data: message,
      })
      .then(() => {
        console.log('Discord webhook sent');
      })
      .catch((e) => {
        console.log(e);
      });
  }
};
