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

export type IDebugCellProps = {
  grid: t.IGrid;
  cellKey: string;
  refs?: any;
  isCurrent?: boolean;
  theme?: 'DARK';
  style?: GlamorValue;
};
export type IDebugCellState = {};

export class DebugCell extends React.PureComponent<IDebugCellProps, IDebugCellState> {
  public state: IDebugCellState = {};
  private state$ = new Subject<Partial<IDebugCellState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: IDebugCellProps) {
    super(props);
  }

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */

  /**
   * [Render]
   */
  public render() {
    const { cellKey = '', refs, grid, isCurrent } = this.props;
    const cell = { ...grid.data.cells[cellKey] } || undefined;
    const hash = cell ? cell.hash : undefined;
    if (cell) {
      delete cell.hash;
    }

    const isEmpty = cell ? Object.keys(cell).length === 0 : false;
    const value = util.getValueSync({ grid, key: cellKey }) || '';
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

    let data: any = cellKey ? { 't.ICellData': cell, refs } : {};
    data = ast ? { ...data, ast } : data;

    const elHash = hash && (
      <Label tooltip={hash} style={styles.hash}>
        <Badge backgroundColor={COLORS.CLI.YELLOW} color={COLORS.DARK}>
          sha256
        </Badge>
        {util.formatHash(hash, { trimPrefix: true })}
      </Label>
    );

    const emptyTitle = cellKey ? `${cellKey}${isCurrent ? '' : ' (previous)'}: <empty>` : `<none>`;
    const valueTitle = `t.ICellData${isCurrent ? '' : ' (previous)'}`;
    const title = isEmpty ? emptyTitle : valueTitle;

    const objectName = isEmpty ? '<none>' : cellKey || '<none>';
    const elObject =
      !isEmpty &&
      this.renderObject({
        name: objectName,
        data,
        // expandPaths: ['$', '$."t.ICellData"'],
      });

    return (
      <Panel style={styles.base} title={'Cell'}>
        <div {...styles.title}>
          <Label color={isEmpty ? 0.3 : 0.5}>{title}</Label>
          {elHash}
        </div>
        {elObject}
      </Panel>
    );
  }

  private renderObject(
    props: { name?: string; data?: any; expandLevel?: number; expandPaths?: string[] } = {},
  ) {
    return (
      <ObjectView
        name={props.name}
        data={props.data}
        theme={this.props.theme}
        expandLevel={props.expandLevel}
        expandPaths={props.expandPaths}
      />
    );
  }
}
