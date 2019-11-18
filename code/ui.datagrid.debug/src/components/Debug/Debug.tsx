import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import {
  util,
  color,
  COLORS,
  constants,
  coord,
  css,
  func,
  GlamorValue,
  R,
  t,
  value,
} from '../common';
import { ObjectView } from '../primitives';
import { Badge, Hr, HrDashed, Label, LinkButton, Panel } from '../widgets';
import { DebugCell } from './Debug.Cell';

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

    change$.subscribe(e => this.updateState());

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
    const grid = this.grid;
    return {
      get current() {
        return util.formatSelection({ grid, selection: self.grid.selection });
      },
      get last() {
        const selection: t.IGridSelection = self.state.lastSelection || { ranges: [] };
        return util.formatSelection({ grid, selection });
      },
    };
  }

  /**
   * [Methods]
   */
  public getValue: t.RefGetValue = async key => this.getValueSync(key);
  private getValueSync = (key: string) => util.getValueSync({ grid: this.grid, key });

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

    return value.deleteUndefined({
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
        (cells[key] as any).hash = util.formatHash(hash);
      }
    });

    return value.deleteUndefined({ ns, cells, rows, columns });
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
        const list = next.refs.map((ref: t.IRefOut) => {
          const keys = pathToKeys(ref.path);
          err = ref.error ? '(err)' : err;
          return keys;
        });
        const keys = R.uniq(R.flatten(list));
        acc[next.key] = `${keys.filter(key => key !== next.key).join(',')}${err}`;
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
        PaddingX: 14,
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
    const last = this.selectedCell.last;
    const styles = {
      base: css({
        padding: 12,
        marginBottom: 50,
      }),
    };
    return (
      <div {...styles.base}>
        {this.renderSelection()}
        {last && this.renderCellPanel()}
        {this.renderNsPanel()}
        {this.renderUiPanel()}
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

  private renderCellPanel() {
    const last = this.selectedCell.last;
    const current = this.selectedCell.current;
    const isCurrent = last.key === current.key;
    const key = last.key || '';

    const refs = {
      out: this.state.outgoing,
      in: this.state.incoming,
    };

    return (
      <div>
        <DebugCell
          grid={this.grid}
          cellKey={key}
          isCurrent={isCurrent}
          refs={refs}
          theme={this.theme}
        />
      </div>
    );
  }

  private renderNsPanel() {
    const refsKeys = {
      out: this.state.outgoing,
      in: this.state.incoming,
      'sorted (topological)': this.state.order,
    };
    return (
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
    );
  }

  private renderUiPanel() {
    return (
      <Panel title={'UI'}>
        {this.renderObject({
          name: 't.IGrid',
          data: this.state.grid,
          expandLevel: 0,
        })}
      </Panel>
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

// /**
//  * [Helpers]
//  */

// const STYLES = {
//   hr: css({
//     margin: 0,
//     MarginY: 12,
//     border: 'none',
//     borderTop: `solid 3px ${color.format(0.06)}`,
//   }),
//   hrDashed: css({
//     margin: 0,
//     MarginY: 6,
//     marginLeft: 12,
//     border: 'none',
//     borderTop: `dashed 1px ${color.format(0.2)}`,
//   }),
// };

// const Hr = () => <hr {...STYLES.hr} />;
// const HrDashed = () => <hr {...STYLES.hrDashed} />;

// const LinkButton = (props: IButtonProps) => {
//   const styles = {
//     base: css({
//       color: COLORS.CLI.CYAN,
//     }),
//   };
//   return <Button {...props} style={styles.base} />;
// };

// const Label = (props: {
//   children?: React.ReactNode;
//   tooltip?: string;
//   color?: string | number;
//   style?: GlamorValue;
// }) => {
//   const styles = {
//     base: css({
//       fontFamily: constants.MONOSPACE.FAMILY,
//       fontSize: 12,
//       color: color.format(defaultValue(props.color, 0.5)),
//       marginBottom: 6,
//       boxSizing: 'border-box',
//     }),
//   };
//   return (
//     <div {...css(styles.base, props.style)} title={props.tooltip}>
//       {props.children}
//     </div>
//   );
// };

// const Badge = (props: {
//   children?: React.ReactNode;
//   color: string;
//   backgroundColor: string;
//   style?: GlamorValue;
// }) => {
//   const styles = {
//     base: css({
//       boxSizing: 'border-box',
//       display: 'inline-block',
//       color: props.color,
//       backgroundColor: props.backgroundColor,
//       borderRadius: 2,
//       marginRight: 5,
//       PaddingX: 3,
//       PaddignY: 2,
//       border: `solid 1px ${color.format(0.2)}`,
//     }),
//   };
//   return <div {...css(styles.base, props.style)}>{props.children}</div>;
// };

// const Panel = (props: { title?: string; children?: React.ReactNode; style?: GlamorValue }) => {
//   const styles = {
//     base: css({
//       position: 'relative',
//       boxSizing: 'border-box',
//       borderRadius: 4,
//       backgroundColor: color.format(-0.1),
//       MarginY: 15,
//       boxShadow: `inset 0 0 10px 0 ${color.format(-0.3)}`,
//       border: `solid 1px ${color.format(-0.4)}`,
//     }),
//     title: css({
//       fontSize: 12,
//       marginBottom: 10,
//       paddingBottom: 3,
//       PaddingY: 8,
//       Flex: 'center-spaceBetween',
//       borderBottom: `solid 1px ${color.format(-0.3)}`,
//       color: color.format(0.5),
//       backgroundColor: color.format(-0.1),
//     }),
//     children: css({
//       padding: 10,
//       paddingTop: 0,
//     }),
//   };
//   return (
//     <div {...css(styles.base, props.style)}>
//       <div {...styles.title}>
//         <div />

//         {props.title || 'Untitled'}

//         <div />
//       </div>
//       <div {...styles.children}>{props.children}</div>
//     </div>
//   );
// };
