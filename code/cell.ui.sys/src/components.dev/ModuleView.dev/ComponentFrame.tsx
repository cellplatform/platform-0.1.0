import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { COLORS, css, CssValue, t, color } from './common';

export type IComponentFrameProps = {
  children?: React.ReactNode;
  blur?: boolean;
  backgroundColor?: string | number;
  name?: string;
  style?: CssValue;
};
export type IComponentFrameState = t.Object;

export class ComponentFrame extends React.PureComponent<
  IComponentFrameProps,
  IComponentFrameState
> {
  public state: IComponentFrameState = {};
  private state$ = new Subject<Partial<IComponentFrameState>>();
  private unmounted$ = new Subject<void>();

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */
  public render() {
    const { blur } = this.props;

    const styles = {
      base: css({
        Absolute: 0,
        flex: 1,
        display: 'flex',
        position: 'relative',
        boxSizing: 'border-box',
      }),
      bg: css({
        Absolute: 0,
        backgroundColor: color.format(this.props.backgroundColor),
        opacity: blur ? 0.3 : 1,
        pointerEvents: 'none',
      }),
      border:
        blur &&
        css({
          Absolute: 0,
          border: `solid 1px ${color.format(1)}`,
          pointerEvents: 'none',
        }),
      inner: css({
        flex: 1,
        Absolute: 0,
        display: 'flex',
        filter: blur ? `blur(3px)` : undefined,
        opacity: blur ? 0.4 : 1,
        pointerEvents: blur ? 'none' : 'auto',
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        {this.renderHeader()}
        <div {...styles.bg}></div>
        <div {...styles.inner}>{this.props.children}</div>
        {blur && <div {...styles.border}></div>}
      </div>
    );
  }

  private renderHeader() {
    const styles = {
      base: css({
        Absolute: [-17, 0, null, 0],
        fontSize: 9,
        Flex: 'horizontal-end-spaceBetween',
        fontFamily: 'Menlo, monospace',
        color: COLORS.DARK,
        opacity: 0.6,
      }),
    };
    return (
      <div {...styles.base}>
        <div></div>
        <div>{this.props.name}</div>
      </div>
    );
  }
}
