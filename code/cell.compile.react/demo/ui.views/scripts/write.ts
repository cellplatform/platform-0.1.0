import { Client, t, Schema, time } from '../src/common';
import { log } from '@platform/log/lib/server';

/**
 * Invite (UI):
 *    Cloud:          https://dev.db.team/cell:ck6bmume4000008mqhkkdaebj!A1/file/dist/index.html?def=ns:ck6fjv938000008mm76p201v2
 *    Local (Dev):    http://localhost:1234/?def=localhost:8080:ns:ck6fjv938000008mm76p201v2
 *    Local (Cloud):  http://localhost:1234/?def=dev.db.team:ns:ck6fjv938000008mm76p201v2
 *
 *
 * Definition/State:
 *    Datagrid (UI):      https://alpha.hypersheet.io/cell:ck68sk05x0000ktetfz8w5zyr!A1/file/dist/parcel/index.html?def=ns:ck6fjv938000008mm76p201v2
 *    Activity Log:       https://alpha.hypersheet.io/cell:ck68sk05x0000ktetfz8w5zyr!A1/file/dist/parcel/index.html?def=ns:ck68ivf06000008l44wpo1dxl
 *    Namespace (JSON):   https://alpha.hypersheet.io/ns:ck6fjv938000008mm76p201v2
 *
 *
 * Code Editor:
 *  - https://alpha.hypersheet.io/cell:ck68v714w0000afetfheb662w!A1/file/dist/parcel/index.html
 */

const writeConfig = async (args: { id: string; host: string; def: string; inviteUrl: string }) => {
  const { id, host, def, inviteUrl } = args;
  const cells: t.ICellMap = {};

  const client = Client.create(host);
  const ns = client.ns(def);

  cells.A1 = { value: 'title' };
  cells.B1 = { value: 'Conversation Invite.' };

  // Invitees.
  cells.A2 = { value: 'invitees' };

  cells.B2 = { value: 'Rowan' };
  cells.C2 = {
    value:
      'https://dev.db.team/cell:ck6bmume4000008mqhkkdaebj!A1/file/static/images/avatar/rowan-128.jpg',
  };

  cells.B3 = { value: 'Deb' };
  cells.C3 = {
    value:
      'https://dev.db.team/cell:ck6bmume4000008mqhkkdaebj!A1/file/static/images/avatar/deb-128.jpg',
  };

  // glenkyne@mediaworks.co.nz

  // cells.B4 = { value: 'gautam@hypersheet.io' };
  // cells.C4 = {
  //   value:
  //     'https://dev.db.team/cell:ck5st4aop0000ffet9pi2fkvp!B1/file/static/images/avatar/gautam.jpg',
  // };

  // Activity log (REF).
  cells.A5 = { value: 'activity log' };
  cells.B5 = { value: 'ns:ck6h4dv13000208mogia9hjhw' };

  // State.
  cells.B6 = { value: 'date:' };
  cells.C6 = { value: '14 Feb 2020 2:30:00' };

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
  await logUrls({ id, host, def, inviteUrl });
};

const logUrls = async (args: { id: string; host: string; def: string; inviteUrl: string }) => {
  const { id, host, def } = args;
  const ns = Schema.uri.parse<t.INsUri>(def).parts.id;

  const table = log.table({ border: false });

  const localhost = {
    server: 'localhost:8080',
    ui: 'localhost:1234',
  };

  // const client = Client.create(host);
  // const origin = client.origin;
  const urls = Schema.urls(host);
  // const urlsLocal = Schema.urls(localhost);

  const datagrid =
    'https://dev.db.team/cell:ck68sk05x0000ktetfz8w5zyr!A1/file/dist/parcel/index.html';

  const url = {
    def: urls
      .ns(ns)
      .info.query({ cells: true })
      .toString(),
    dev: {
      local: `http://${localhost.ui}/?def=${localhost.server}:${def}`,
      cloud: `http://${localhost.ui}/?def=${host}:${def}`,
    },
    invite: `${args.inviteUrl}?def=${def}`,
    datagrid: `${datagrid}?def=${def}`,
  };

  const add = (key: string, value: string) => {
    const bullet = log.green('•');
    table.add([` ${bullet} ${key}  `, log.cyan(value)]);
  };

  add('ui: invite', url.invite);
  add('ui: datagrid', url.datagrid);
  add('def', url.def);
  add('ui: dev (local data)', url.dev.local);
  add('ui: dev (cloud data)', url.dev.cloud);

  log.info();
  log.info.green(id);
  log.info.gray(table.toString());
  log.info();
};

/**
 * Initialize
 */
(async () => {
  const HISTORY = [
    {
      id: 'iteration-demo',
      host: 'alpha.hypersheet.io',
      def: 'ns:ck6bm01wa000a08mc89cyego0',
      inviteUrl: '',
    },
    {
      id: 'glen',
      host: 'dev.db.team',
      def: 'ns:ck6fjv938000008mm76p201v2',
      inviteUrl: 'https://dev.db.team/cell:ck6bmume4000008mqhkkdaebj!A1/file/dist/index.html',
    },
    {
      id: 'deb',
      host: 'dev.db.team',
      def: 'ns:ck6h33tit000008mt36b74r2v',
      inviteUrl: 'https://dev.db.team/cell:ck6bmume4000008mqhkkdaebj!A2/file/dist/index.html',
    },
  ];

  const write = async (index: number) => writeConfig(HISTORY[index]);
  const logItem = async (index: number) => logUrls(HISTORY[index]);

  await write(2);
  // await logItem(2);
})();
