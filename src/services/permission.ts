import { Permission } from '@customtypes/permissions';

export const addPermissions = (server, req, done) => {
  if (req.dbuser.clanid && req.dbuser.discordid) {
    server.mysql.query(
      'select clanid, discordID, request, kickmembers, walkers, bot, diplomacy from clanpermissions where clanid=? and discordID=?',
      [req.dbuser.clanid, req.dbuser.discordid],
      (err, result) => {
        if (result && result[0]) {
          req.clanPermissions = {
            clanid: result[0].clanid,
            discordid: result[0].discordID,
            request: Boolean(result[0].request),
            kickmembers: Boolean(result[0].kickmembers),
            walkers: Boolean(result[0].walkers),
            bot: Boolean(result[0].bot),
            diplomacy: Boolean(result[0].diplomacy),
          };
        }
        done();
      },
    );
  } else {
    done();
  }
};

export const hasPermissions = (server, memberId, permission: Permission) => {
  if (memberId) {
    server.mysql.query(
      'select users.discordID, users.clanid clanid, clans.leaderid from users, clans where users.clanid=clans.clanid and users.discordID=?',
      [memberId],
      (e, r) => {
        if (r && r[0]) {
          const clanId = r[0].clanid;
          const leaderId = r[0].leaderid;

          if (memberId === leaderId) {
            return true;
          }

          if (clanId && leaderId) {
            server.mysql.query(
              'select clanid, discordID, request, kickmembers, walkers, bot, diplomacy from clanpermissions where clanid=? and discordID=?',
              [clanId, memberId],
              (err, result) => {
                if (result && result[0]) {
                  return result[0][permission];
                } else if (err) {
                  return false;
                } else {
                  return false;
                }
              },
            );
          } else {
            return false;
          }
        } else if (e) {
          return false;
        } else {
          return false;
        }
      },
    );
  } else {
    return false;
  }
};
