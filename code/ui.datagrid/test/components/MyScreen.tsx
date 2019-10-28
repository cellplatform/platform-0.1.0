import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, COLORS, GlamorValue, ObjectView, t, cell } from '../common';

export type IMyScreenProps = {
  cell?: string;
  style?: GlamorValue;
};
export type IMyScreenState = {};

export class MyScreen extends React.PureComponent<IMyScreenProps, IMyScreenState> {
  public state: IMyScreenState = {};
  private state$ = new Subject<Partial<IMyScreenState>>();
  private unmounted$ = new Subject<{}>();

  public static contextType = cell.Context;
  public context!: t.ICellContext;

  /**
   * [Lifecycle]
   */
  constructor(props: IMyScreenProps) {
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
   * [Render]
   */
  public render() {
    return <this.RenderFrame>{this.renderDebug()}</this.RenderFrame>;
  }

  private renderDebug() {
    const styles = {
      base: css({
        width: 380,
        marginBottom: '8%',
      }),
      title: css({
        borderBottom: `solid 6px ${color.format(-0.1)}`,
        marginBottom: 8,
        Flex: 'horizontal-center-start',
      }),
      cell: css({
        backgroundColor: COLORS.BLUE,
        color: COLORS.WHITE,
        PaddingX: 8,
        PaddingY: 2,
        marginRight: 10,
        border: `solid 1px ${color.format(-0.05)}`,
      }),
    };

    const context = this.context;

    return (
      <div {...styles.base}>
        <div {...styles.title}>
          <div {...styles.cell}>{this.props.cell || 'UNKNOWN_CELL'}</div>
          <div>type: "MyScreen"</div>
        </div>
        <ObjectView name={'context (env)'} data={context} />
      </div>
    );
  }

  private RenderFrame(props: { children?: React.ReactNode }) {
    const styles = {
      base: css({
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        flex: 1,
      }),
      inner: css({
        Absolute: 40,
        border: `solid 1px ${color.format(-0.2)}`,
        Flex: 'center-center',
        backgroundColor: COLORS.WHITE,
        boxShadow: `0 0 8px 0 ${color.format(-0.1)}`,
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.inner}>{props.children}</div>
      </div>
    );
  }
}
