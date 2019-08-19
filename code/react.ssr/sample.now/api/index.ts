import { server } from '@platform/react.ssr';

const manifest = 'https://platform.sfo2.digitaloceanspaces.com/modules/react.ssr/manifest.yml';
const app = server.init({ manifest });
export default app.server;

// import { fs } from '@platform/fs';

// const path = fs.join(__dirname, '../package.json');

// console.log('path', path);

// const dir = fs.resolve(fs.join(__dirname, '..'));

// console.log('dir', dir);

// const names = fs.readdirSync(dir);

// console.log('names', names);

// const api = fs.readdirSync(fs.join(dir, 'api'));

// console.log('api', api);

/**
 * // TEMP 🐷
 */

// import { micro } from '@platform/micro';
// const mini = micro.init();
// mini.router.get('*', async req => {
//   return { data: { msg: 123 } };
// });
// export default mini.server;
