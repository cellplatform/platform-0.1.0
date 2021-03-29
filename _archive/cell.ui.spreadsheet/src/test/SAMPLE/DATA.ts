import { t } from '../../common';

const CELLS: t.IGridData['cells'] = {
  A1: { value: 'hello' },
};

const COLUMNS: t.IGridData['columns'] = {
  A: { props: { grid: { width: 250 } } },
};

const ROWS: t.IGridData['rows'] = {
  // 2: { props: { grid: { height: 80 } } },
};

export type ISampleData = {
  ns: string;
  cells: t.IGridData['cells'];
  columns: t.IGridData['columns'];
  rows: t.IGridData['rows'];
};

export const SAMPLE: ISampleData = {
  ns: 'ns:foo', // NB: the "ns:" uri prefix is stripped.
  cells: CELLS,
  columns: COLUMNS,
  rows: ROWS,
};
