import type { MapInfo } from '@customtypes/maps';

export const addMapInfo = (server, req, done) => {
  if (req.params.mapid && (req?.query?.mappass || req?.body?.mappass)) {
    const pass = req?.query?.mappass ?? req?.body?.mappass;

    server.mysql.query(
      'select mapid, typemap, discordID as discordid, name, dateofburning, pass, allowedit from clanmaps where mapid=? and pass=?',
      [req.params.mapid, pass],
      (_err, result) => {
        if (result?.[0]) {
          req.mapInfo = result[0] as MapInfo;
        }
        done();
      },
    );
  } else {
    done();
  }
};
