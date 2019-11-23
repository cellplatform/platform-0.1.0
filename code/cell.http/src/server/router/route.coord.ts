import { cell, t, models } from '../common';
import { ROUTES } from './ROUTES';

const { Uri } = cell;

/**
 * Coordinate routes (cell: | row: | col:).
 */
export function init(args: { title?: string; db: t.IDb; router: t.IRouter }) {
  const { db, router } = args;

  /**
   * GET /cell:<id>!A1
   */
  router.get(ROUTES.CELL.BASE, async req => {
    return { status: 200, data: { msg: 'cell' } };
  });

  /**
   * GET /row:<id>!A1
   */
  router.get(ROUTES.ROW.BASE, async req => {
    return { status: 200, data: { msg: 'row' } };
  });

  /**
   * GET /col:<id>!A1
   */
  router.get(ROUTES.COLUMN.BASE, async req => {
    return { status: 200, data: { msg: 'column' } };
  });
}
