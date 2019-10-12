import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import {
  coord,
  R,
  color,
  COLORS,
  constants,
  css,
  GlamorValue,
  t,
  value as valueUtil,
} from '../../common';
import { ObjectView, Button, IButtonProps } from '../primitives';

const { deleteUndefined } = valueUtil;

export type IDebugProps = {
  grid: t.IGrid;
  theme?: 'DARK';
  style?: GlamorValue;
};
export type IDebugState = {
  grid?: any;
  refs?: any;
  incoming?: any;
  outgoing?: any;
  order?: any;
};

export class Debug extends React.PureComponent<IDebugProps, IDebugState> {
  public state: IDebugState = {};
  private state$ = new Subject<Partial<IDebugState>>();
  private unmounted$ = new Subject<{}>();

  private getValue: t.RefGetValue = async key => this.getValueSync(key);
  private getValueSync = (key: string) => {
    const cell = this.grid.cells[key];
    return cell && typeof cell.value === 'string' ? cell.value : undefined;
  };

  private refTable = coord.refs.table({
    getKeys: async () => Object.keys(this.grid.cells),
    getValue: this.getValue,
  });

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
    const events$ = this.grid.events$.pipe(takeUntil(this.unmounted$));
    const change$ = events$.pipe(
      filter(e => e.type === 'GRID/cells/change'),
      map(e => e.payload as t.IGridCellsChange),
    );

    events$.pipe(filter(e => e.type === 'GRID/selection')).subscribe(() => {
      this.updateGrid();
    });

    change$.subscribe(e => {
      console.log('change', e);
      this.updateState();
    });

    // Finish up.
    this.updateState();
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get grid() {
    return this.props.grid;
  }

  public get theme() {
    return this.props.theme || 'DARK';
  }

  public get selectedCell() {
    const key = this.grid.selection.cell || '';
    const value = this.getValueSync(key) || '';
    const isEmpty = !Boolean(value);
    const isFormula = coord.func.isFormula(value);

    // Display string.
    const MAX = 30;
    let display = value.length > MAX ? `${value.substring(0, MAX)}...` : value;
    display = isEmpty ? '<empty>' : display;

    // Formula.
    const ast = isFormula ? coord.ast.toTree(value) : undefined;

    // Finish up.
    return { key, value, display, isEmpty, isFormula, ast };
  }

  /**
   * [Methods]
   */

  private async updateState(args: { force?: boolean } = {}) {
    const { force } = args;
    await this.updateGrid();
    await this.updateRefs({ force });
  }

  public async getDataGrid() {
    const grid = this.grid;
    const { selection, rows, columns, isEditing, clipboard } = grid;

    const cells = R.clone(grid.cells);
    Object.keys(cells).forEach(key => {
      const hash = cells[key] ? (cells[key] as any).hash : undefined;
      if (hash) {
        (cells[key] as any).hash = `${hash.substring(0, 12)}..(SHA-256)`;
      }
    });

    return deleteUndefined({
      isEditing,
      cells,
      rows,
      columns,
      selection,
      clipboard,
    });
  }

  public async updateGrid() {
    this.state$.next({
      grid: await this.getDataGrid(),
    });
  }

  public async updateRefs(args: { force?: boolean } = {}) {
    const { force } = args;
    const refs = await this.refTable.refs({ force });

    const pathToKeys = (path?: string) => (path || '').split('/').filter(part => part);

    const sortKeys = (obj: { [key: string]: any }) => {
      return coord.cell.sort(Object.keys(obj)).reduce((acc, key) => {
        acc[key] = obj[key];
        return acc;
      }, {});
    };

    // Prepare display versions of data.
    const incoming = Object.keys(refs.in)
      .map(key => ({ key, refs: refs.in[key] }))
      .reduce((acc, next) => {
        acc[next.key] = next.refs.map((ref: t.IRefIn) => ref.cell).join(',');
        return acc;
      }, {});

    const outgoing = Object.keys(refs.out)
      .map(key => ({ key, refs: refs.out[key] }))
      .reduce((acc, next) => {
        let err = '';
        const keys = R.pipe(
          R.flatten,
          R.uniq,
        )(
          next.refs.map((ref: t.IRefOut) => {
            const keys = pathToKeys(ref.path);
            err = ref.error ? '(err)' : err;
            return keys;
          }),
        );
        acc[next.key] = `${keys.filter(keys => keys !== next.key).join(',')}${err}`;
        return acc;
      }, {});

    const order = coord.refs.sort({ refs }).keys;

    // Finish up.
    this.state$.next({ refs, incoming, outgoing, order });
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Absolute: 0,
        color: COLORS.WHITE,
        Flex: 'vertical-stretch-stretch',
      }),
      body: css({
        flex: 1,
        Scroll: true,
      }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        {this.renderToolbar()}
        <div {...styles.body}>{this.renderBody()}</div>
      </div>
    );
  }

  private renderToolbar() {
    const styles = {
      base: css({
        borderBottom: `solid 1px ${color.format(0.2)}`,
        Flex: 'horizontal-center-spaceBetween',
        height: 32,
        PaddingX: 12,
        fontSize: 14,
      }),
    };
    return (
      <div {...styles.base}>
        <div>{/* left */}</div>
        <div>
          <LinkButton label={'Refresh'} onClick={this.handleRefresh} />
        </div>
      </div>
    );
  }

  private renderBody() {
    const styles = {
      base: css({ padding: 12, marginBottom: 50 }),
    };

    const selectedCell = this.selectedCell;
    const elFormula = selectedCell.ast && (
      <div>
        <Hr />
        {this.renderObject({
          name: 'formula (AST)',
          data: selectedCell.ast,
          expandLevel: 3,
        })}
      </div>
    );

    return (
      <div {...styles.base}>
        {this.renderSelection()}
        <Hr />
        {this.renderObject({ name: 'ui.datagrid', data: this.state.grid })}
        <Hr />
        {this.renderObject({ name: 'refs', data: this.state.refs })}
        <Hr />
        {this.renderObject({
          name: 'refs (keys)',
          data: {
            in: this.state.incoming,
            out: this.state.outgoing,
            'topological order': this.state.order,
          },
          expandPaths: ['$', '$.in', '$.out'],
        })}
        {elFormula}
      </div>
    );
  }

  private renderObject(
    props: { name?: string; data?: any; expandLevel?: number; expandPaths?: string[] } = {},
  ) {
    return (
      <ObjectView
        name={props.name}
        data={props.data}
        theme={this.theme}
        expandLevel={props.expandLevel}
        expandPaths={props.expandPaths}
      />
    );
  }

  private renderSelection() {
    const selection = this.selectedCell;
    const styles = {
      base: css({
        fontSize: 12,
        color: COLORS.WHITE,
        fontFamily: constants.MONOSPACE.FAMILY,
        minHeight: 15,
        Flex: 'center-start',
      }),
      noSelection: css({
        opacity: 0.3,
      }),
      selection: css({
        Flex: 'horizontal',
      }),
      key: css({
        marginRight: 5,
        color: COLORS.CLI.PINK,
      }),
      value: css({
        opacity: selection.isEmpty ? 0.3 : 1,
      }),
    };

    const elNoSelection = !selection.key && <div {...styles.noSelection}>No selection</div>;
    const elSelection = selection.key && (
      <div {...styles.selection}>
        <div {...styles.key}>{selection.key}:</div>
        <div {...styles.value}>{selection.display}</div>
      </div>
    );

    return (
      <div {...styles.base}>
        {elNoSelection}
        {elSelection}
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private handleRefresh = () => {
    this.updateState();
  };
}

/**
 * [Helpers]
 */

const STYLES = {
  hr: css({
    margin: 0,
    MarginY: 12,
    border: 'none',
    borderTop: `solid 3px ${color.format(0.06)}`,
  }),
};

const Hr = () => <hr {...STYLES.hr} />;

const LinkButton = (props: IButtonProps) => {
  const styles = {
    base: css({
      color: COLORS.CLI.CYAN,
    }),
  };
  return <Button {...props} style={styles.base} />;
};
