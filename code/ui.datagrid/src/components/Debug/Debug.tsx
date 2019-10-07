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
import { ObjectView } from '../primitives';

const { deleteUndefined } = valueUtil;
const MAGENTA = '#DC6FEC';

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
    const cell = this.grid.values[key];
    return cell && typeof cell.value === 'string' ? cell.value : undefined;
  };

  private refTable = coord.refs.table({
    getKeys: async () => Object.keys(this.grid.values),
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

    // events$.subscribe(e => {
    //   console.log('|||||', e);
    // });

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
    const MAX = 30;
    let display = value.length > MAX ? `${value.substring(0, MAX)}...` : value;
    display = isEmpty ? '<empty>' : display;
    return { key, value, display, isEmpty };
  }

  /**
   * [Methods]
   */

  private async updateState() {
    await this.updateGrid();
    await this.updateRefs();
  }

  public async getDataGrid() {
    const grid = this.grid;
    const { selection, rows, columns, isEditing, clipboard } = grid;

    const values = R.clone(grid.values);
    Object.keys(values).forEach(key => {
      const hash = values[key] ? (values[key] as any).hash : undefined;
      if (hash) {
        (values[key] as any).hash = `${hash.substring(0, 12)}..(SHA-256)`;
      }
    });

    return deleteUndefined({
      isEditing,
      values,
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
        color: COLORS.WHITE,
      }),
    };

    // const data = this.dataGrid;

    return (
      <div {...css(styles.base, this.props.style)}>
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
        color: MAGENTA,
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
}

/**
 * [Helpers]
 */

const STYLES = {
  hr: css({
    margin: 0,
    MarginY: 12,
    border: 'none',
    borderTop: `solid 1px ${color.format(0.1)}`,
  }),
};

const Hr = () => <hr {...STYLES.hr} />;
