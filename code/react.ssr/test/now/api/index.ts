import { server } from '@platform/react.ssr';

// import { fs } from '@platform/fs';
// const r = fs.resolve('./foo');
// console.log('r', r);

// const manifest = 'https://platform.sfo2.digitaloceanspaces.com/modules/react.ssr/manifest.yml';
// const app = server.init({ manifest });

// console.log('server.init', server.init);

/**
 * Glob
 */

import glob from 'glob';

console.log('glob', glob);

/**
 * temp
 */

import { micro } from '@platform/micro';
const app = micro.init();
app.router.get('*', async req => {
  // console.log('-------------------------------------------');

  return new Promise((resolve, reject) => {
    const r = glob('*.js', (err, res) => {
      console.log('res', res);
      resolve({ data: res });
    });
  });

  return { data: { msg: 123 } };
});
export default app.server;
