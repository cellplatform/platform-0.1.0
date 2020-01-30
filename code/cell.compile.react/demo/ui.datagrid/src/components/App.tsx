import '@platform/css/reset.css';
import '@platform/ui.datagrid/import.css';

import { css, color } from '@platform/react';
import * as React from 'react';
import { DataGrid, Grid } from '@platform/ui.datagrid';
import { DATA } from './DATA';

import * as t from '@platform/ui.datagrid.types';

export type IAppProps = {};
export type IAppState = {};

export const factory: t.GridFactory = req => {
  // if (req.type === 'EDITOR') {
  //   return renderEditor(req);
  // }

  // if (req.type === 'SCREEN') {
  //   return renderScreen(req);
  // }

  // if (req.type === 'CELL') {
  //   return renderCell(req);
  // }

  console.log(`Factory type '${req.type}' not supported by test.`, req);
  return null;
};

export class App extends React.PureComponent<IAppProps, IAppState> {
  public state: IAppState = {};

  public grid = Grid.create({
    totalColumns: 52,
    totalRows: 1000,
    // getFunc,
    // keyBindings: [{ command: 'COPY', key: 'CMD+D' }],
    // defaults: { rowHeight: 200 },
    ns: DATA.NS,
    cells: DATA.CELLS,
    columns: DATA.COLUMNS,
    rows: DATA.ROWS,
  });

  /**
   * [Lifecycle]
   */
  constructor(props: IAppProps) {
    super(props);
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Absolute: 50,
        border: `solid 1px ${color.format(-0.2)}`,
        display: 'flex',
      }),
      grid: css({ flex: 1 }),
    };
    return (
      <div {...styles.base}>
        <DataGrid
          grid={this.grid}
          factory={factory}
          // Handsontable={this.Table}
          // events$={this.events$}
          initial={{ selection: 'A1' }}
          style={styles.grid}
          canSelectAll={false}
        />
      </div>
    );
  }
}
