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
      argv: ['entry:builder', 'entry:harness', 'entry:shell'],
      devPort: 1234,
      devTools: false,
      width: 1200,
      height: 700,
      minHeight: 200,
      minWidth: 520,
    },
  });
}
