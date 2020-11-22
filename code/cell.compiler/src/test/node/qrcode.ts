import qrcode from 'qrcode';
// import { fs } from '@platform/fs';

// import { Runtime } from '@platform/cell.runtime/lib/runtime';
// import { Encoding } from '@platform/cell.runtime/lib/runtime/common';

(async () => {
  // const URL = 'https://news.ycombinator.com/';
  // const code = await qrcode.toString(URL);

  // console.log(URL);
  // console.log(code);

  console.log('Test Code');

  try {
    console.log('__CELL__', __CELL__);
  } catch (error) {
    console.log('error', error);
  }

  // console.log();
  // await __webpack_init_sharing__('default');
  // console.log('__webpack_init_sharing__', __webpack_init_sharing__);
  // console.log('__webpack_share_scopes__', __webpack_share_scopes__);

  // const bundle = Runtime.bundle();
  // console.log('bundle', bundle);

  // const url = 'http://localhost:5000/cell:ckhp9kvl600096iet0hfcbkvc:A1/file/sample/remoteEntry.js';
  // const res = Runtime.remote({ url, namespace: 'tmp.node', entry: './Main' });

  // // require('./tmp.js');
  // // console.log('res', res);
  // // console.log('fetch', fetch);

  // const rr = await __webpack_init_sharing__('default');
  // console.log('rr', rr);

  // const scope = Encoding.escapeNamespace(res.namespace);

  // console.log('scope', scope);
  // // console.log('global', global);
  // // const r = global[scope];
  // // console.log('r', r);

  // // const m = await res.module();

  // // console.log('self', self);
  // const f = global[scope];
  // console.log('f', f);

  // // Object.keys(global).forEach((key) => )

  // // console.log(m);

  // // console.log('jsdom', jsdom);
  // console.log('global.remote', (global as any).remote);
})();

// http://localhost:5000/cell:ckhp9kvl600096iet0hfcbkvc:A1
