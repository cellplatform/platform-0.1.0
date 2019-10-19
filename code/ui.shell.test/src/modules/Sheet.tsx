import '@platform/ui.datagrid/import.css';

import datagrid from '@platform/ui.datagrid';
import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, t, shell } from '../common';

export const init: t.ShellImportInit = async args => {
  const { shell } = args;
  shell.state.body.el = <Sheet />;
};

export type ISheetProps = {};
export type ISheetState = {};

export class Sheet extends React.PureComponent<ISheetProps, ISheetState> {
  public state: ISheetState = {};
  private state$ = new Subject<Partial<ISheetState>>();
  private unmounted$ = new Subject<{}>();
  private grid$ = new Subject<datagrid.GridEvent>();

  public static contextType = shell.Context;
  public context!: t.IShellContext;

  private grid = datagrid.Grid.create({});

  /**
   * [Lifecycle]
   */
  constructor(props: ISheetProps) {
    super(props);
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({ Absolute: 0, display: 'flex' }),
      grid: css({ flex: 1 }),
    };
    // const totalColum
    return (
      <div {...styles.base}>
        <datagrid.DataGrid
          grid={this.grid}
          events$={this.grid$}
          factory={this.factory}
          // Handsontable={Handsontable}
          initial={{ selection: 'A1' }}
          style={styles.grid}
          canSelectAll={false}
        />
      </div>
    );
  }

  private factory: t.GridFactory = req => {
    switch (req.type) {
      // case 'EDITOR':
      //   return this.renderEditor();

      // case 'CELL':
      //   return formatValue(req.value);

      default:
        // console.log(`Factory type '${req.type}' not supported by test.`);
        return null;
    }
  };
}
