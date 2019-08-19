import { server } from '@platform/react.ssr';

import { fs } from '@platform/fs';
// const r = fs.resolve('./foo');
// console.log('r', r);

const manifest = 'https://platform.sfo2.digitaloceanspaces.com/modules/react.ssr/manifest.yml';
// const app = server.init({ manifest });

console.log('server', server);

// export default app.server;
// console.log('server.init', server.init);

/**
 * Glob
 */

// import glob from 'glob';

// console.log('glob', glob);

/**
 * // TEMP 🐷
 */

import { micro } from '@platform/micro';
const mini = micro.init();
mini.router.get('*', async req => {
  return { data: { msg: 123 } };
});
export default mini.server;
