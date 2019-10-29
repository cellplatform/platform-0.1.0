import * as React from 'react';
import { Subject } from 'rxjs';
import { debounceTime, delay, filter, map, takeUntil } from 'rxjs/operators';

import {
  Button,
  color,
  COLORS,
  coord,
  css,
  datagrid,
  GlamorValue,
  Hr,
  log,
  t,
  util,
} from '../common';
import { getFunc, SAMPLE } from '../data';
import { TestGridView } from './Test.Grid.view';

export type ITestGridProps = {
  editorType: t.TestEditorType;
  style?: GlamorValue;
};
export type ITestGridState = { data?: any };

export class TestGrid extends React.PureComponent<ITestGridProps, ITestGridState> {
  public state: ITestGridState = {};
  private unmounted$ = new Subject<{}>();
  private state$ = new Subject<Partial<ITestGridState>>();
  private events$ = new Subject<t.GridEvent>();

  public grid = datagrid.Grid.create({
    totalColumns: 52,
    totalRows: 1000,
    getFunc,
    // keyBindings: [{ command: 'COPY', key: 'CMD+D' }],
    // defaults: { rowHeight: 200 },
    cells: SAMPLE.CELLS,
    columns: SAMPLE.COLUMNS,
    rows: SAMPLE.ROWS,
  });

  private getValueSync = (key: string) => {
    const cell = this.grid.data.cells[key];
    return cell && typeof cell.value === 'string' ? cell.value : undefined;
  };
  private getValue: t.RefGetValue = async key => this.getValueSync(key);

  private refTable = coord.refs.table({
    getKeys: async () => Object.keys(this.grid.data.cells),
    getValue: this.getValue,
  });

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    // Update state.
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));

    /**
     * Grid events.
     */
    const events$ = this.events$.pipe(takeUntil(this.unmounted$));
    events$
      .pipe(
        filter(() => true),
        filter(e => e.type === 'GRID/cells/change'),
        map(e => e.payload as t.IGridCellsChange),
        delay(0),
      )
      .subscribe(async e => {
        log.info('🐷 IGridCellsChanged', e);

        // Update refs for individual change.
        const wait = e.changes
          .filter(e => e.isChanged)
          .map(async change => {
            const key = change.cell.key;

            const toValue = (data?: t.IGridCellData) =>
              data && data.value ? data.value.toString() : undefined;
            const from = toValue(change.value.from);
            const to = toValue(change.value.to);
            await this.refTable.update({ key, from, to });

            // console.group('🌳 ', key);
            // console.log('change', change);
            // console.log('update', update);
            // console.groupEnd();
          });
        await Promise.all(wait);

        // e.cancel();
        // e.changes[0].modify('foo');
        // console.log('🌳', e.type, e.payload);
        // const change = e.payload as t.IGridCellChange;
        // change.modify('hello');
      });

    events$
      .pipe(
        filter(() => true),
        filter(e => e.type === 'GRID/EDITOR/end'),
        map(e => e.payload as t.IEndEditing),
      )
      .subscribe(async e => {
        // console.log('cancel edit');
        // e.cancel();
        const key = e.cell.key;
        const value = e.value.to;

        // NB: Ensure change is reflected in grid before the editor is hidden.
        // this.grid.changeCells({ [key]: { value } });
        // this.updateFuncsTemp({ cells: key });

        console.group('🌳 EDIT END');
        console.log('e', e);
        console.groupEnd();

        // e.cancel();
      });

    const command$ = events$.pipe(
      filter(e => e.type === 'GRID/command'),
      map(e => e.payload as t.IGridCommand),
    );

    command$.subscribe(e => {
      log.info('🐷 COMMAND:', e.command, e);
    });

    events$
      .pipe(
        filter(e => e.type === 'GRID/clipboard'),
        map(e => e.payload as t.IGridClipboard),
      )
      .subscribe(e => {
        log.info('📋 CLIPBOARD', e);
      });

    events$
      .pipe(
        filter(e => e.type === 'GRID/clipboard/before/paste'),
        map(e => e.payload as t.IGridClipboardBeforePaste),
      )
      .subscribe(e => {
        if (e.pending) {
          // Modify clipboard before paste.
          // Can be used to inject and transfer clipboard between instances.
          //
          const cells = { ...e.pending.cells, A1: { value: 'boo' } };
          // e.modify({ ...e.pending, cells });
        }
      });

    // Finish up.
    const gridEvents$ = this.grid.events$.pipe(takeUntil(this.unmounted$));
    gridEvents$.pipe(debounceTime(10)).subscribe(() => this.updateState());
    this.updateState();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Properties]
   */

  /**
   * [Methods]
   */
  public async updateState() {
    const { editorType } = this.props;
    const data = {
      debug: { editorType },
    };
    this.state$.next({ data });
    return data;
  }

  public overlayFromCell(cell?: string) {
    const data = this.grid.data.cells[cell || ''];
    const view = data && data.props ? util.toGridCellProps(data.props).view : {};
    const screen = view ? view.screen : undefined;
    if (data && screen && cell) {
      this.grid.command<t.IGridOverlayShowCommand>({
        command: 'OVERLAY/show',
        props: { screen, cell },
      });
    } else {
      this.grid.command<t.IGridOverlayHideCommand>({ command: 'OVERLAY/hide', props: {} });
    }
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Flex: 'horizontal',
        flex: 1,
        backgroundColor: color.format(-0.08),
      }),
    };

    return (
      <div {...styles.base}>
        {this.renderLeft()}
        {this.renderMain()}
        {this.renderState()}
      </div>
    );
  }

  private renderLeft() {
    const styles = {
      base: css({
        position: 'relative',
        width: 230,
        padding: 10,
        Scroll: true,
        fontSize: 13,
        lineHeight: 1.6,
      }),
    };
    return (
      <div {...styles.base}>
        {this.button('calc (all)', async () => {
          const cells = Object.keys(this.grid.data.cells);
          this.grid.calc.update({ cells });
        })}
        <Hr margin={5} />
        {this.button('redraw', () => this.grid.redraw())}
        {this.button('focus', () => this.grid.focus())}
        {this.button('updateHashes', () => {
          this.grid.updateHashes({ force: true });
          this.updateState();
        })}
        <Hr margin={5} />
        {this.button('changeCells', () => this.grid.changeCells({ A1: { value: 'hello' } }))}
        {this.button('changeCells (props)', () =>
          this.grid.changeCells({ A1: { value: 'hello', props: { style: { bold: true } } } }),
        )}
        {this.button('mergeCells (A5)', () => {
          this.grid.changeCells({
            A5: { value: 'merged', props: { merge: { colspan: 3, rowspan: 5 } } },
          });
          this.grid.select({ cell: 'A5' });
        })}
        {this.button('props.value (A1)', () => {
          this.grid.changeCells({
            A1: { value: 'A1', props: { value: 'Display Value' } },
          });
        })}

        <Hr margin={5} />
        {this.button('columns (width) - A:200', () =>
          this.grid.changeColumns({ A: { props: { width: 200 } } }),
        )}
        {this.button('columns (width) - A:300', () =>
          this.grid.changeColumns({ A: { props: { width: 300 } } }),
        )}
        {this.button('rows (height) - 1:0', () =>
          this.grid.changeRows({ '1': { props: { height: 0 } } }),
        )}
        {this.button('rows (height) - 1:120', () =>
          this.grid.changeRows({ '1': { props: { height: 120 } } }),
        )}
        <Hr margin={5} />
        {this.button('select: A1', () => this.grid.select({ cell: 'A1' }))}
        {this.button('select: A1 and range', () =>
          this.grid.select({ cell: 'A1', ranges: ['B2:C4', 'C2:D7'] }),
        )}
        {this.button('select: bottom/right', () => {
          this.grid.select({
            cell: { row: this.grid.totalRows, column: this.grid.totalColumns },
          });
        })}
        {this.button('select column: B:B', () => this.grid.select({ cell: 'B1', ranges: ['B:B'] }))}
        {this.button('select row: 3:3', () => this.grid.select({ cell: 'A3', ranges: ['3:3'] }))}
        {this.button('select row and column', () =>
          this.grid.select({ cell: 'B1', ranges: ['3:3', 'B:B'], scrollToCell: false }),
        )}
        <Hr margin={5} />
        {this.button('scrollTo: A1', () => this.grid.scrollTo({ cell: 'A1' }))}
        {this.button('scrollTo: B5', () => this.grid.scrollTo({ cell: 'B5' }))}
        {this.button('scrollTo: bottom/right', () => {
          this.grid.scrollTo({
            cell: { row: this.grid.totalRows, column: this.grid.totalColumns },
          });
        })}
        <Hr margin={5} />
        {this.button('screen: hide', () =>
          this.grid.command({ command: 'OVERLAY/hide', props: {} }),
        )}
        {this.button('screen: A1 (none defined)', () => this.overlayFromCell('A1'))}
        {this.button('screen: C1 (via cell def)', () => this.overlayFromCell('C1'))}
        {this.button('screen: C2 (via explicit command)', () => {
          this.grid.command({
            command: 'OVERLAY/show',
            props: {
              cell: 'A2',
              screen: { type: 'MyScreen', className: 'my-custom' },
            },
          });
        })}

        {/* <Hr margin={5} />
            {this.button(
              'changeBorders - B2:D4 (red)',
              () => (this.grid.borders = [{ range: 'B2:D4', style: { width: 2, color: 'red' } }]),
            )}
            {this.button(
              'changeBorders - B2:D4 (orange)',
              () =>
                (this.grid.borders = [{ range: 'B2:D4', style: { width: 2, color: 'orange' } }]),
            )}
            {this.button(
              'changeBorders (different edges)',
              () =>
                (this.grid.borders = [
                  {
                    range: 'C8:E12',
                    style: {
                      top: { width: 2, color: 'red' },
                      right: { width: 2, color: 'blue' },
                      bottom: { width: 2, color: 'orange' },
                      left: { width: 2, color: 'green' },
                    },
                  },
                ]),
            )}
            {this.button('changeBorders (clear)', () => (this.grid.borders = []))} */}
      </div>
    );
  }

  private renderMain() {
    const styles = {
      base: css({ position: 'relative', flex: 1 }),
      inner: css({
        Absolute: 10,
        border: `solid 1px ${color.format(-0.2)}`,
      }),
      grid: css({ Absolute: 0 }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.inner}>
          <TestGridView
            style={styles.grid}
            grid={this.grid}
            editorType={this.props.editorType}
            events$={this.events$}
          />
        </div>
      </div>
    );
  }

  private renderState() {
    const data = this.state.data;
    if (!data) {
      return null;
    }
    const styles = {
      base: css({
        position: 'relative',
        backgroundColor: COLORS.DARK,
        color: COLORS.WHITE,
        width: 300,
        borderBottom: `solid 1px ${color.format(0.1)}`,
      }),
    };
    return (
      <div {...styles.base}>
        <datagrid.Debug grid={this.grid} />
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private button = (label: string, handler: () => void) => {
    return <Button label={label} onClick={handler} block={true} />;
  };
}
