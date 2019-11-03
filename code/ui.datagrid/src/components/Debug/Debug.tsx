import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import {
  defaultValue,
  color,
  COLORS,
  constants,
  coord,
  css,
  func,
  GlamorValue,
  R,
  t,
  value as valueUtil,
} from '../common';
import { Button, IButtonProps, ObjectView } from '../primitives';
import { DebugProps } from './Debug.Props';

const { deleteUndefined } = valueUtil;

export type IDebugProps = {
  grid: t.IGrid;
  theme?: 'DARK';
  style?: GlamorValue;
};
export type IDebugState = {
  grid?: any;
  data?: any;
  refs?: any;
  incoming?: any;
  outgoing?: any;
  order?: any;
  lastSelection?: t.IGridSelection;
};

export class Debug extends React.PureComponent<IDebugProps, IDebugState> {
  public state: IDebugState = {};
  private state$ = new Subject<Partial<IDebugState>>();
  private unmounted$ = new Subject<{}>();

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

    events$
      .pipe(
        filter(e => e.type === 'GRID/selection'),
        map(e => e.payload as t.IGridSelectionChange),
      )
      .subscribe(e => {
        this.updateGrid();
        if (e.to.cell || !this.state.lastSelection) {
          this.state$.next({ lastSelection: e.to });
        }
      });

    change$.subscribe(e => {
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
    const self = this; // tslint:disable-line
    const formatSelection = this.formatSelection;
    return {
      get current() {
        return formatSelection(self.grid.selection);
      },
      get last() {
        const selection: t.IGridSelection = self.state.lastSelection || { ranges: [] };
        return formatSelection(selection);
      },
    };
  }
  private formatSelection = (
    selection: t.IGridSelection,
    options: { maxValueLength?: number } = {},
  ) => {
    const { maxValueLength = 30 } = options;

    const ranges = selection.ranges;
    const key = selection.cell || '';
    const value = this.getValueSync(key) || '';
    const cell = this.grid.data.cells[key];
    const isEmpty = !Boolean(value);

    // Display string.
    const MAX = maxValueLength;
    let display = value.length > MAX ? `${value.substring(0, MAX)}...` : value;
    display = isEmpty ? '<empty>' : display;

    // Finish up.
    return { key, value, cell, display, isEmpty, ranges };
  };

  /**
   * [Methods]
   */
  public getValue: t.RefGetValue = async key => this.getValueSync(key);
  private getValueSync = (key: string) => {
    const cell = this.grid.data.cells[key];
    return cell && typeof cell.value === 'string' ? cell.value : undefined;
  };

  private async updateState(args: { force?: boolean } = {}) {
    const { force } = args;
    await this.updateGrid();
    await this.updateRefs({ force });
  }

  private async updateGrid() {
    this.state$.next({
      grid: await this.getGridProps(),
      data: await this.getGridData(),
    });
  }

  private async getGridProps() {
    const grid = this.grid;
    const { selection, isEditing, clipboard } = grid;

    return deleteUndefined({
      isEditing,
      selection,
      clipboard,
    });
  }

  private async getGridData() {
    const grid = this.grid;
    const { ns, rows, columns } = grid.data;

    const cells = R.clone(grid.data.cells);
    Object.keys(cells).forEach(key => {
      const hash = cells[key] ? (cells[key] as any).hash : undefined;
      if (hash) {
        (cells[key] as any).hash = this.formatHash(hash);
      }
    });

    return deleteUndefined({ ns, cells, rows, columns });
  }

  private formatHash(hash?: string, options: { trimPrefix?: string } = {}) {
    const { trimPrefix } = options;
    hash = hash && trimPrefix ? hash.replace(new RegExp(`^${trimPrefix}`), '') : hash;
    const length = trimPrefix ? 5 : 12;
    return hash ? `${hash.substring(0, length)}..${hash.substring(hash.length - 5)}` : hash;
  }

  private async updateRefs(args: { force?: boolean } = {}) {
    const refsTable = this.grid.refsTable;
    if (!refsTable) {
      return;
    }

    const { force } = args;
    const refs = await refsTable.refs({ force });

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
    this.state$.next({
      refs,
      incoming: sortKeys(incoming),
      outgoing: sortKeys(outgoing),
      order,
    });
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
        backgroundColor: color.format(-0.2),
        Flex: 'horizontal-center-spaceBetween',
        height: 32,
        PaddingX: 12,
        fontSize: 14,
      }),
      edge: css({ Flex: 'horizontal' }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.edge}>{/* left */}</div>
        <div {...styles.edge}>
          <LinkButton label={'refresh'} onClick={this.refreshHandler({ force: true })} />
        </div>
      </div>
    );
  }

  private renderBody() {
    const styles = {
      base: css({ padding: 12, marginBottom: 50 }),
    };

    const refsKeys = {
      out: this.state.outgoing,
      in: this.state.incoming,
      'sorted (topological)': this.state.order,
    };

    const last = this.selectedCell.last;
    const elLast = last && <Panel title={'Cell'}>{this.renderLastCell()}</Panel>;

    return (
      <div {...styles.base}>
        {this.renderSelection()}
        {elLast}

        <Panel title={'Namespace'}>
          <Label>t.INsData</Label>
          {this.renderObject({ name: 'data', data: this.state.data })}
          <Hr />
          <Label>t.IRefs</Label>
          {this.renderObject({ name: 'refs', data: this.state.refs })}
          <HrDashed />
          {this.renderObject({
            name: 'refs (keys)',
            data: refsKeys,
            // expandPaths: ['$', '$.in', '$.out'],
          })}
        </Panel>

        <Panel title={'UI'}>
          {/* <Label>t.IGrid</Label> */}
          {this.renderObject({ name: 't.IGrid', data: this.state.grid, expandLevel: 0 })}
        </Panel>
        <DebugProps />
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
    const selection = this.selectedCell.current;
    const styles = {
      base: css({
        fontSize: 12,
        color: COLORS.WHITE,
        fontFamily: constants.MONOSPACE.FAMILY,
        Flex: 'center-start',
        minHeight: 15,
      }),
      noSelection: css({
        opacity: 0.35,
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

  private renderLastCell() {
    const last = this.selectedCell.last;
    if (!last || !last.key) {
      // return null;
    }

    const current = this.selectedCell.current;
    const isCurrent = last.key === current.key;

    const key = last.key || '';
    const cell = { ...this.grid.data.cells[key] } || undefined;
    const hash = cell ? cell.hash : undefined;
    if (cell) {
      delete cell.hash;
    }

    const isEmpty = cell ? Object.keys(cell).length === 0 : false;
    const value = this.getValueSync(key) || '';
    const isFormula = func.isFormula(value);
    const ast = isFormula ? coord.ast.toTree(value) : undefined;

    const styles = {
      base: css({}),
      title: css({
        position: 'relative',
        cursor: 'default',
      }),
      hash: css({
        color: COLORS.CLI.YELLOW,
        Absolute: [0, 0, null, null],
      }),
    };

    const refs = {
      out: this.state.outgoing,
      in: this.state.incoming,
    };
    let data: any = key ? { 't.ICellData': cell, refs } : {};
    data = ast ? { ...data, ast } : data;

    const elHash = hash && (
      <Label tooltip={hash} style={styles.hash}>
        <Badge backgroundColor={COLORS.CLI.YELLOW} color={COLORS.DARK}>
          sha256
        </Badge>
        {this.formatHash(hash, { trimPrefix: 'sha256-' })}
      </Label>
    );

    const emptyTitle = key ? `${key}: <empty>` : `<none>`;
    const title = `${isEmpty ? emptyTitle : 't.ICellData'} ${!isCurrent ? '(last)' : ''}`;
    const name = isEmpty ? '<none>' : key || '<none>';
    const elObject =
      !isEmpty &&
      this.renderObject({
        name,
        data,
        // expandPaths: ['$', '$."t.ICellData"'],
      });

    return (
      <div {...styles.base}>
        <div {...styles.title}>
          <Label color={isEmpty ? 0.3 : 0.5}>{title}</Label>
          {elHash}
        </div>
        {elObject}
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private refreshHandler = (args: { force?: boolean }) => {
    return () => {
      const { force } = args;
      this.updateState({ force });
    };
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
  hrDashed: css({
    margin: 0,
    MarginY: 6,
    marginLeft: 12,
    border: 'none',
    borderTop: `dashed 1px ${color.format(0.2)}`,
  }),
};

const Hr = () => <hr {...STYLES.hr} />;
const HrDashed = () => <hr {...STYLES.hrDashed} />;

const LinkButton = (props: IButtonProps) => {
  const styles = {
    base: css({
      color: COLORS.CLI.CYAN,
    }),
  };
  return <Button {...props} style={styles.base} />;
};

const Label = (props: {
  children?: React.ReactNode;
  tooltip?: string;
  color?: string | number;
  style?: GlamorValue;
}) => {
  const styles = {
    base: css({
      fontFamily: constants.MONOSPACE.FAMILY,
      fontSize: 12,
      color: color.format(defaultValue(props.color, 0.5)),
      marginBottom: 6,
      boxSizing: 'border-box',
    }),
  };
  return (
    <div {...css(styles.base, props.style)} title={props.tooltip}>
      {props.children}
    </div>
  );
};

const Badge = (props: {
  children?: React.ReactNode;
  color: string;
  backgroundColor: string;
  style?: GlamorValue;
}) => {
  const styles = {
    base: css({
      boxSizing: 'border-box',
      display: 'inline-block',
      color: props.color,
      backgroundColor: props.backgroundColor,
      borderRadius: 2,
      marginRight: 5,
      PaddingX: 3,
      PaddignY: 2,
      border: `solid 1px ${color.format(0.2)}`,
    }),
  };
  return <div {...css(styles.base, props.style)}>{props.children}</div>;
};

const Panel = (props: { title?: string; children?: React.ReactNode }) => {
  const styles = {
    base: css({
      position: 'relative',
      boxSizing: 'border-box',
      borderRadius: 4,
      backgroundColor: color.format(-0.1),
      MarginY: 15,
      boxShadow: `inset 0 0 10px 0 ${color.format(-0.3)}`,
      border: `solid 1px ${color.format(-0.4)}`,
    }),
    title: css({
      fontSize: 12,
      marginBottom: 10,
      paddingBottom: 3,
      PaddingY: 8,
      Flex: 'center-spaceBetween',
      borderBottom: `solid 1px ${color.format(-0.3)}`,
      color: color.format(0.5),
      backgroundColor: color.format(-0.1),
    }),
    children: css({
      padding: 10,
      paddingTop: 0,
    }),
  };
  return (
    <div {...styles.base}>
      <div {...styles.title}>
        <div />

        {props.title || 'Untitled'}

        <div />
      </div>
      <div {...styles.children}>{props.children}</div>
    </div>
  );
};
