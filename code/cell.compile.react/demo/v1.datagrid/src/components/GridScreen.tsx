import '@platform/css/reset.css';
import '@platform/ui.datagrid/import.css';

import { DataGrid, Grid } from '@platform/ui.datagrid';
import * as React from 'react';
import { Subject } from 'rxjs';

import { css, t } from '../common';
import { DATA, factory } from '../SAMPLE';

export type IGridScreenProps = {};
export type IGridScreenState = {};

export class GridScreen extends React.PureComponent<IGridScreenProps, IGridScreenState> {
  public state: IGridScreenState = {};
  private events$ = new Subject<t.GridEvent>();

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
  constructor(props: IGridScreenProps) {
    super(props);
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Absolute: 0,
        // border: `solid 1px ${color.format(-0.2)}`,
        display: 'flex',
      }),
      grid: css({ flex: 1 }),
    };
    return (
      <div {...styles.base}>
        <DataGrid
          grid={this.grid}
          factory={factory}
          events$={this.events$}
          initial={{ selection: 'A1' }}
          style={styles.grid}
          canSelectAll={false}
        />
      </div>
    );
  }
}
