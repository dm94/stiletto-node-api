import { MapInfo } from '@customtypes/maps';

export const addMapInfo = (server, req, done) => {
  if (req.dbuser.clanid && req.dbuser.discordid) {
    server.mysql.query(
      'select mapid, typemap, discordID as discordid, name, dateofburning, pass, allowedit from clanmaps where mapid=? and pass=?',
      [req.params.mapid, req.query.mappass],
      (err, result) => {
        if (result && result[0]) {
          req.mapInfo = result[0] as MapInfo;
        }
        done();
      },
    );
  } else {
    done();
  }
};
