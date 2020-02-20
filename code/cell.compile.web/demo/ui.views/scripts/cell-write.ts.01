import { Client, t, Schema } from '../src/common';
import { log } from '@platform/log/lib/server';

/**
 * Invite (UI):
 *    Cloud:        https://alpha.hypersheet.io/cell:ck6bmume4000008mqhkkdaebj!A1/file/dist/index.html?def=ns:ck6bm01wa000a08mc89cyego0
 *    Local (Dev):  http://localhost:1234/?def=localhost:8080:ns:ck6bm01wa000a08mc89cyego0
 *
 *
 * Definition/State:
 *    Datagrid (UI):      https://alpha.hypersheet.io/cell:ck68sk05x0000ktetfz8w5zyr!A1/file/dist/parcel/index.html?def=ns:ck6bm01wa000a08mc89cyego0
 *    Activity Log:       https://alpha.hypersheet.io/cell:ck68sk05x0000ktetfz8w5zyr!A1/file/dist/parcel/index.html?def=ns:ck68ivf06000008l44wpo1dxl
 *    Namespace (JSON):   https://alpha.hypersheet.io/ns:ck6bm01wa000a08mc89cyego0
 *
 *
 * Code Editor:
 *  - https://alpha.hypersheet.io/cell:ck68v714w0000afetfheb662w!A1/file/dist/parcel/index.html
 */

const write = async (args: { host: string; def: string }) => {
  const { host, def } = args;
  const cells: t.ICellMap = {};

  const client = Client.create(host);
  const ns = client.ns(def);

  cells.A1 = { value: 'title' };
  cells.B1 = { value: 'Meeting Invite.' };

  // Invitees.
  cells.A2 = { value: 'invitees' };

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
  cells.B5 = { value: 'ns:ck6bm01wa000b08mcbk311n19' };

  // State.
  cells.B6 = { value: 'date:' };
  cells.C6 = { value: 'Feb 08 2020 10:00:00 GMT+1300' };

  cells.B7 = { value: '' };
  cells.C7 = { value: '' };

  await ns.write({ cells });
  const res = await ns.read({ data: true });

  // console.log('res.changes', res.);
  // console.log('-------------------------------------------');
  // console.log('res', res.body.data);
  // console.log('-------------------------------------------');
  // console.log('HOST ', HOST);
  // console.log('DEF  ', DEF);
  await logUrls({ host, def });
};

const logUrls = async (args: { host: string; def: string }) => {
  const { host, def } = args;
  const ns = Schema.uri.parse<t.INsUri>(def).parts.id;

  const client = Client.create(host);
  const origin = client.origin;

  // const ns = client.ns(def);

  const gray = log.info.gray;

  gray();
  gray(`def:   ${origin}/${log.cyan(def)}?cells=true`);
  gray(`invite:`);
  // gray(`  cloud:   ${origin}/cell:${}`)
};

/**
 * Initialize
 */
(async () => {
  // const HOST = 'localhost:8080';
  const host = 'alpha.hypersheet.io';
  const def = 'ns:ck6bm01wa000a08mc89cyego0';

  await write({ host, def });
  // await logUrls({ host, def });
})();

/**
 * Invite (UI):
 *    Cloud:        https://alpha.hypersheet.io/cell:ck6bmume4000008mqhkkdaebj!A1/file/dist/index.html?def=ns:ck6bm01wa000a08mc89cyego0
 *    Local (Dev):  http://localhost:1234/?def=localhost:8080:ns:ck6bm01wa000a08mc89cyego0
 *
 *
 * Definition/State:
 *    Datagrid (UI):      https://alpha.hypersheet.io/cell:ck68sk05x0000ktetfz8w5zyr!A1/file/dist/parcel/index.html?def=ns:ck6bm01wa000a08mc89cyego0
 *    Activity Log:       https://alpha.hypersheet.io/cell:ck68sk05x0000ktetfz8w5zyr!A1/file/dist/parcel/index.html?def=ns:ck68ivf06000008l44wpo1dxl
 *    Namespace (JSON):   https://alpha.hypersheet.io/ns:ck6bm01wa000a08mc89cyego0
 *
 *
 * Code Editor:
 *  - https://alpha.hypersheet.io/cell:ck68v714w0000afetfheb662w!A1/file/dist/parcel/index.html
 */
