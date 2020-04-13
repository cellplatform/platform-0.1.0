import { Client, t } from '../common';
import * as sync from './client.sync';
import { NS } from './constants';

/**
 * Writes (initializes) system data.
 */
export async function writeSys(host: string) {
  const http = Client.http(host);
  const ns = http.ns(NS.APP);

  if (!(await ns.exists())) {
    await ns.write({ ns: { type: { implements: NS.TYPE.APP } } });
  }

  const type = Client.type({ http });
  const sheet = await type.sheet<t.CellApp>(NS.APP);

  // const state = sheet.state;
  sync.saveMonitor({ http, state: sheet.state, silent: true });

  const app = sheet.cursor().row(0);
  await app.ready();

  console.log('-------------------------------------------');
  console.log('sheet.uri', sheet.uri.toString());

  console.log('typeDef', sheet.types);

  // app.props.title = 'hello1';
  // app.props.title = 'CellOS';

  console.log('-------------------------------------------');
  console.log('app.title', app.props.title);
  console.log('-------------------------------------------');

  const windows = await app.props.windows.ready();
  sync.saveMonitor({ http, state: windows.sheet.state, silent: false });

  // console.log('windows.typeDef', windows.typeDef);
  console.log('windows.isReady', windows.isReady);
  console.log('windows.typeDef', windows.typeDef.type.types);
  console.log('-------------------------------------------');

  // windows.
  const cursor = await windows.cursor();

  // cursor.

  const window = cursor.row(0);

  console.log('window.types', window.types.list);
  console.log('window.title', window.props.title);
  console.log('window.height', window.props.height);
}
