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
    name: '@platform/cell.ui.sys',
    entryPath: 'bundle/index.html',
    sourceDir: paths.bundle['cell.ui.sys'],
    devPort: 1234,
    props: {
      width: 2000,
      height: 800,
      // width: 500,
      // height: 320,
      minHeight: 300,
      minWidth: 150,
    },
  });

  // await typeDefs.app.define({
  //   ctx,
  //   row: 1,
  //   name: '@platform/cell.ui.finder',
  //   entryPath: 'bundle/index.html',
  //   sourceDir: paths.bundle['cell.ui.finder'],
  //   devPort: 1235,
  // });

  // await typeDefs.app.define({
  //   ctx,
  //   row: 2,
  //   name: '@platform/cell.ui.ide',
  //   entryPath: 'bundle/index.html',
  //   sourceDir: paths.bundle['cell.ui.ide'],
  //   devPort: 1236,
  // });

  // await typeDefs.app.define({
  //   ctx,
  //   row: 3,
  //   name: '@platform/cell.ui.spreadsheet',
  //   entryPath: 'bundle/index.html',
  //   sourceDir: paths.bundle['cell.ui.spreadsheet'],
  //   devPort: 1237,
  // });
}
