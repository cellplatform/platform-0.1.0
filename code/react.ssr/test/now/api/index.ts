import { micro } from '@platform/micro';

// import { server } from '@platform/react.ssr';

// const manifestUrl = 'https://platform.sfo2.digitaloceanspaces.com/modules/react.ssr/manifest.yml';
// const app = server.init({ manifestUrl });

// export default app.server;

const app = micro.init();

app.router.get('*', async req => {
  return { data: { msg: 123 } };
});

export default app.server;
