import { t } from '../common';

/**
 * Retrieve a single cell.
 */
export type GetCell<P extends t.ICellProps = t.ICellProps> = (
  key: string,
) => Promise<t.ICellData<P> | undefined>;

/**
 * Retrieve a table of cells.
 */
export type GetCells<P extends t.ICellProps = t.ICellProps> = () => Promise<t.ICellMap<P>>;
