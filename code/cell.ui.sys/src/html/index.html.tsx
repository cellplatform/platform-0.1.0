console.log('cell.ui.sys 👋');

// import '../config';
// import { Client, Uri, Schema, t } from '../common';
// import * as React from 'react';
// import * as ReactDOM from 'react-dom';
// import { Root } from '../components/Root';
// import { reset } from '@platform/css';

// reset();
// const win = (window as unknown) as t.ITopWindow;
// const env = win.env;

// (async () => {
//   console.group('🌳 module: cell.ui.sys');
//   console.log('process.argv:', process.argv.length);
//   console.log('env', env);

//   // console.log('uri', uri.toString());
//   const client = Client.typesystem({ http: env.host, cache: env.cache });
//   const uri = Uri.row(env.def);
//   const ns = client.http.ns(uri.ns);

//   const tmp = await ns.read({ cells: true });
//   console.log('ns.read:', tmp.body.data);

//   console.log('-------------------------------------------');

//   const sheet = await client.sheet(uri.ns);

//   const index = Schema.coord.cell.toAxisIndex('ROW', uri.key);
//   const cursor = await sheet.data('AppWindow').load();

//   const row = cursor.row(0);

//   console.log('row', row.toObject());

//   console.log('sheet', sheet);
//   console.log('sheet.types', sheet.types);
//   console.log('-------------------------------------------');

//   console.log('env.cache', env.cache);
//   // console.log('env.cache.keys:', env.cache.keys);
//   // env.cache.keys.forEach(e => {
//   //   console.log('  -- ', e);
//   // });

//   // env.cache.keys.forEach(async key => {
//   //   console.log(' > ', key, await env.cache.get(key));
//   // });

//   console.groupEnd();

//   // async function writeRow() {
//   //   console.log('row', row.toObject());

//   // }

//   env.event$.subscribe((e) => {
//     console.log('module  | 🌳 event', e);
//     // writeRow()
//   });

//   const el = <Root env={env} uri={env.def} />;
//   ReactDOM.render(el, document.getElementById('root'));
// })();
