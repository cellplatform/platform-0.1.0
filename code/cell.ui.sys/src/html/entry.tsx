import '../config';
import { Client, Uri, Schema, t } from '../common';

const win = (window as unknown) as t.ITopWindow;
const env = win.env;

(async () => {
  console.group('🌳 module: cell.ui.sys');
  console.log('process.argv:', process.argv);
  console.log('env', env);

  // console.log('uri', uri.toString());
  const client = Client.typesystem({ http: env.host, cache: env.cache });
  const uri = Uri.row(env.def);
  const ns = client.http.ns(uri.ns);

  const tmp = await ns.read({ cells: true });
  console.log('ns.read:', tmp.body.data);

  console.log('-------------------------------------------');

  const sheet = await client.sheet(uri.ns);

  const index = Schema.coord.cell.toAxisIndex('ROW', uri.key);
  console.log('index', index);
  const row = await sheet
    .data<t.SysAppWindow>('SysAppWindow')
    .row(index)
    .load();

  console.log('row', row.toObject());

  console.log('sheet', sheet);
  console.log('sheet.types', sheet.types);
  console.log('env.cache', env.cache);

  console.groupEnd();

  env.event$.subscribe(e => {
    console.log('module  | 🌳 event', e);
  });
})();
