import { server } from '@platform/react.ssr';

const manifest = 'https://platform.sfo2.digitaloceanspaces.com/modules/react.ssr/manifest.yml';
const app = server.init({ manifest });
export default app.server;

/**
 * // TEMP 🐷
 */

// import { micro } from '@platform/micro';
// const mini = micro.init();
// mini.router.get('*', async req => {
//   return { data: { msg: 123 } };
// });
// export default mini.server;
