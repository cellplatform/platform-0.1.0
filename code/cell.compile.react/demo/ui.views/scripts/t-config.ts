import { Client, t } from '../src/common';

/**
 * Invite:
 * - https://alpha.hypersheet.io/cell:ck5st4aop0000ffet9pi2fkvp!B1/file/dist/index.html?def=ns:ck68bc6f2000b08l59z4v14g2
 *
 * DataGrid:
 *    Def:
 *    - https://alpha.hypersheet.io/cell:ck68sk05x0000ktetfz8w5zyr!A1/file/dist/parcel/index.html?def=ns:ck68bc6f2000b08l59z4v14g2
 *
 *    Activity Log:
 *    - https://alpha.hypersheet.io/cell:ck68sk05x0000ktetfz8w5zyr!A1/file/dist/parcel/index.html?def=ns:ck68ivf06000008l44wpo1dxl
 *
 */

// const HOST = 'dev.db.team';
const HOST = 'alpha.hypersheet.io';
// const HOST = 'localhost:8080';
const DEF = 'ns:ck68bc6f2000b08l59z4v14g2';

const client = Client.create(HOST);
const ns = client.ns(DEF);

(async () => {
  const cells: t.ICellMap = {};

  cells.A1 = { value: 'title' };
  cells.B1 = { value: 'Meeting Invite.' };

  // Invitees.
  cells.A2 = { value: 'invitees:' };

  cells.B2 = { value: 'phil@hypersheet.io' };
  cells.C2 = {
    value:
      'https://dev.db.team/cell:ck5st4aop0000ffet9pi2fkvp!B1/file/static/images/avatar/phil.png',
  };

  cells.B3 = { value: 'woo@hypersheet.io' };
  cells.C3 = {
    value:
      'https://dev.db.team/cell:ck5st4aop0000ffet9pi2fkvp!B1/file/static/images/avatar/willy.jpg',
  };

  cells.B4 = { value: 'gautam@hypersheet.io' };
  cells.C4 = {
    value:
      'https://dev.db.team/cell:ck5st4aop0000ffet9pi2fkvp!B1/file/static/images/avatar/gautam.jpg',
  };

  // Activity log (REF).
  cells.A5 = { value: 'activity log' };
  cells.B5 = { value: 'ns:ck68ivf06000008l44wpo1dxl' };

  // State.
  cells.B6 = { value: 'date:' };
  cells.C6 = { value: 'Thu Feb 06 2020 11:00:00 GMT+1300' };

  cells.B7 = { value: '' };
  cells.C7 = { value: '' };

  await ns.write({ cells });
  const res = await ns.read({ data: true });

  // console.log('res.changes', res.);
  console.log('-------------------------------------------');
  console.log('res', res.body.data);
  console.log('-------------------------------------------');
  console.log('HOST ', HOST);
  console.log('DEF  ', DEF);
})();
