export const addPermissions = (server, req, done) => {
  if (req.dbuser.clanid && req.dbuser.discordid) {
    server.mysql.query(
      'select clanid, discordID, request, kickmembers, walkers, bot, diplomacy from clanpermissions where clanid=? and discordID=?',
      [req.dbuser.clanid, req.dbuser.discordid],
      (err, result) => {
        if (result && result[0]) {
          req.clanPermissions = {
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
