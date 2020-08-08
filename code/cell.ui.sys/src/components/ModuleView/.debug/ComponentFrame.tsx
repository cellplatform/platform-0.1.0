import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { COLORS, css, CssValue, t } from '../../../common';

export type IComponentFrameProps = {
  children?: React.ReactNode;
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
  private unmounted$ = new Subject();

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
    const styles = {
      base: css({
        Absolute: 0,
        flex: 1,
        display: 'flex',
        position: 'relative',
      }),
      inner: css({
        flex: 1,
        Absolute: 0,
        display: 'flex',
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        {this.renderHeader()}
        <div {...styles.inner}>{this.props.children}</div>
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
