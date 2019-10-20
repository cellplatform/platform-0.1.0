import { app } from './common';
app.listen({ port: 8080 });

// import { micro } from '@platform/micro';
// import { log } from '@platform/log/lib/server';

// const PKG = require('../package.json') as { name: string; version: string };

// export const app = micro.init({
//   cors: true,
//   log: {
//     package: log.white(PKG.name),
//     version: PKG.version,
//   },
// });

// app.router.get('/foo', async req => {
//   log.info('GET', req.url);
//   return {
//     status: 200,
//     headers: { 'x-foo': 'hello' },
//     data: { message: 'hello' },
//   };
// });
