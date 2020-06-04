import { datagrid } from '../../common';
import { SAMPLE } from './DATA';

export const grid = datagrid.Grid.create({
  totalColumns: 52,
  totalRows: 1000,
  //   // getFunc,
  //   // keyBindings: [{ command: 'COPY', key: 'CMD+D' }],
  //   // defaults: { rowHeight: 200 },
  ns: SAMPLE.ns,
  cells: SAMPLE.cells,
  columns: SAMPLE.columns,
  rows: SAMPLE.rows,
});
