import axios from 'axios';

const baseUrl = "https://discord.com/api/";
const scopes = ['identify','guilds'];

export const getAccessToken = async (code: string) => {
  const options = {
    method: "post",
    url: `${baseUrl}oauth2/token`,
    params: {
      grant_type: "authorization_code",
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      redirect_uri: process.env.DISCORD_REDIRECT_URL,
      code: code,
    },
  };

  return await axios.request(options)
    .then((response) => { 
      return response.data;
    }).catch((error) => { 
      console.log(error);
      return null;
    });
};
export const getUser = async (accessToken: string) => {
  const options = {
    method: "get",
    url: `${baseUrl}users/@me`,
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    }
  };
    
  return await axios.request(options)
    .then((response) => { 
      return response.data;
    }).catch((error) => { 
      console.log(error);
      return null;
    });
};
