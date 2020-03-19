import { Http, HttpClient } from '../common';
import { fetch } from './fetch';

// import { CellRouter } from '@platform/cell.http.router';
// import { CellRouter } from '../../../src';
import { NeDb } from '@platform/fsdb.nedb';

export async function init() {
  // const client = http.create();

  const filename = 'local.db';
  const db = NeDb.create({ filename });
  // const fs: any = {};
  // const body: any = {};
  // // const fs = local.init({ root: PATH.FS });
  // const router = CellRouter.create({ title: 'Browser', db, fs, body });

  console.log('db', db);
  await db.put('foo', 123);
  console.log('db.foo', await db.get('foo'));

  // console.log('CellRouter', CellRouter);

  const http = Http.create({ fetch });
  const client = HttpClient.create({ http });

  const res = await client.info();
  console.log('-------------------------------------------');
  console.log('res', res);
}
