import { constants, t } from '../common';
import { typeDef } from '../main.type';

/**
 * Initialize application type-defs.
 */
export async function define(ctx: t.IContext) {
  const { paths } = constants;

  // Define base modules.
  await typeDef.app.add({
    ctx,
    row: 0,
    sourceDir: paths.bundle['cell.ui.sys'],
    props: {
      name: '@platform/cell.ui.sys',
      entryPath: 'bundle/index.html',
      devPort: 1234,
      devTools: true,
      // width: 2000,
      // height: 800,
      width: 1200,
      height: 700,
      minHeight: 300,
      minWidth: 150,
    },
  });
}
