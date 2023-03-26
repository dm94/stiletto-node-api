import { Permission } from '@customtypes/permissions';

export const hasPermission = async (
  server,
  clanId: number,
  discordId: string,
  permission: Permission,
): Promise<boolean> => {
  await server.mysql.query(
    'select clanid, discordID, request, kickmembers, walkers, bot, diplomacy from clanpermissions where clanid=? and discordID=?',
    [clanId, discordId],
    (err, result) => {
      if (result && result[0]) {
        return result[0][permission] ?? false;
      } else {
        return false;
      }
    },
  );

  return false;
};
