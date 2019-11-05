import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, COLORS, coord, css, func, GlamorValue, t, util, value, cell } from '../common';
import { ObjectView } from '../primitives';
import { Badge, Label, Panel, PanelTitle, LinkButton } from '../widgets';

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
  public get key() {
    return this.props.cellKey || '';
  }

  public get grid() {
    return this.props.grid;
  }

  /**
   * [Methods]
   */

  public showOverlay(field: string) {
    const data = this.grid.data.cells[this.key];
    const view = data && data.props ? util.toGridCellProps(data.props).view : {};
    const screen = view ? view.screen : undefined;

    // console.log('field', field);
    // console.log('screen', screen);
  }

  /**
   * [Render]
   */
  public render() {
    const { refs, isCurrent } = this.props;
    const key = this.key;
    const grid = this.grid;
    const cell = { ...grid.data.cells[key] } || undefined;
    const hash = cell ? cell.hash : undefined;
    if (cell) {
      delete cell.hash;
    }

    const isEmpty = cell ? Object.keys(cell).length === 0 : false;
    const value = util.getValueSync({ grid, key }) || '';
    const isFormula = func.isFormula(value);
    const ast = isFormula ? coord.ast.toTree(value) : undefined;

    const styles = {
      base: css({}),
      title: css({
        position: 'relative',
        cursor: 'default',
      }),
      content: css({
        padding: 10,
        paddingTop: 0,
        // paddingBottom: 5,
      }),
      hash: css({
        color: COLORS.CLI.YELLOW,
        Absolute: [0, 0, null, null],
      }),
    };

    let data: any = key ? { 't.ICellData': cell, refs } : {};
    data = ast ? { ...data, ast } : data;

    const elHash = hash && (
      <Label tooltip={hash} style={styles.hash}>
        <Badge backgroundColor={COLORS.CLI.YELLOW} color={COLORS.DARK}>
          sha256
        </Badge>
        {util.formatHash(hash, { trimPrefix: true })}
      </Label>
    );

    const emptyTitle = key ? `${key}${isCurrent ? '' : ' (previous)'}: <empty>` : `<none>`;
    const valueTitle = `t.ICellData${isCurrent ? '' : ' (previous)'}`;
    const title = isEmpty ? emptyTitle : valueTitle;

    const objectName = isEmpty ? '<none>' : key || '<none>';
    const elObject =
      !isEmpty &&
      this.renderObject({
        name: objectName,
        data,
        // expandPaths: ['$', '$."t.ICellData"'],
      });

    return (
      <Panel style={styles.base} title={'Cell'} padding={0}>
        <div {...styles.content}>
          <div {...styles.title}>
            <Label color={isEmpty ? 0.3 : 0.5}>{title}</Label>
            {elHash}
          </div>
          {elObject}
        </div>

        <PanelTitle center={'Children'} />
        <div {...styles.content}>
          <LinkButton label={'main'} onClick={this.showChildHandler('main')} />
        </div>
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

  /**
   * [Handlers]
   */
  private showChildHandler = (field: string) => {
    return () => this.showOverlay(field);
  };
}
