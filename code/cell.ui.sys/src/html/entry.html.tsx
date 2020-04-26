// import '@platform/polyfill';

import '../config';

// import { css } from '@platform/css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { css, CssValue, Client, Schema, t } from '../common';

// HACK: Importing here to allow scope-hoisting during `bundle`.
// See error:
//        >> tiny-warning.esm.js does not export 'default'
//
// console.log('CssValue', CssValue);

// import { Root } from '../components/Root';
import { loader } from '../loader';

const res = loader.init();
console.log('res', res);
// ReactDOM.render(<Root />, document.getElementById('root'));

// console.log('loader', loader);

console.log('-------------------------------------------');
// console.log('window.location', window.location);

// res.

const uri = Schema.uri.parse<t.ICellUri>(res.window).parts;

// const Client.

(async () => {
  console.log('uri', uri.toString());

  const client = Client.http(res.host);
  const ns = client.ns(uri.ns);

  const f = await ns.read({ cells: true });
  console.log('f.body.data', f.body.data);

  const sheet = await Client.sheet(uri.ns, { http: client });
  console.log('sheet', sheet);
  console.log('sheet.types', sheet.types);
})();
