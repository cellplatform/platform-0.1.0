import '../config';
import { Client, Schema, t } from '../common';

import { loader } from '../loader';

const res = loader.init();
console.log('res', res);

console.log('-------------------------------------------');
const uri = Schema.uri.cell(res.window);

// const Client.

(async () => {
  console.log('uri', uri.toString());
  const client = Client.typesystem(res.host);
  const ns = client.http.ns(uri.ns);

  const tmp = await ns.read({ cells: true });
  console.log('ns.read:', tmp.body.data);

  const sheet = await client.sheet(uri.ns);
  console.log('sheet', sheet);
  console.log('sheet.types', sheet.types);
})();
