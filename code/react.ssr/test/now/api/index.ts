import { server } from '@platform/react.ssr';

// import { fs } from '@platform/fs';
// const r = fs.resolve('./foo');
// console.log('r', r);

// const manifest = 'https://platform.sfo2.digitaloceanspaces.com/modules/react.ssr/manifest.yml';
// const app = server.init({ manifest });

// console.log('server.init', server.init);

/**
 * temp
 */

import { micro } from '@platform/micro';
const app = micro.init();
app.router.get('*', async req => {
  // console.log('-------------------------------------------');
  return { data: { msg: 123 } };
});
export default app.server;
