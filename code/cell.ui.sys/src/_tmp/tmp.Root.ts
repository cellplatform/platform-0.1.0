import { t } from '../common';

export async function tmpRoot(ctx: t.IAppContext) {
  const sheet = await ctx.client.sheet<t.App>('ns:sys.app');

  console.group('🌳 TEMP', sheet.toString());

  // const ctx = this.context;

  console.log('exists', ctx.client.pool?.exists(sheet));
  // sheet.dispose();
  // ctx.client.cache.clear();
  // console.log('exists', ctx.client.pool?.exists(sheet));
  // sheet = await ctx.client.sheet<t.App>('ns:sys.app');
  // console.log('exists', ctx.client.pool?.exists(sheet));
  const apps = sheet.data('App');

  console.log('apps.total', apps.total);

  // apps.TEMP_RESET();
  await apps.load();
  apps.rows.forEach((app) => {
    console.log(' > ', app.toObject());
  });

  console.group('🌳 fetch.getCells');
  const f = await ctx.client.fetch.getCells({ ns: 'ns:sys.app', query: '1:500' });
  console.log('res', f);
  console.log('cells', Object.keys(f.cells || {}));
  console.groupEnd();

  // console.log("apps.", apps.)

  console.groupEnd();
}
