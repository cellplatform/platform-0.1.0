import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { defaultValue, css, color, CssValue, COLORS } from '../../common';

export type IDocPageProps = {
  children?: React.ReactNode;
  depth?: number;
  style?: CssValue;
};
export type IDocPageState = {};

export class DocPage extends React.PureComponent<IDocPageProps, IDocPageState> {
  public state: IDocPageState = {};
  private state$ = new Subject<Partial<IDocPageState>>();
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
   * [Properties]
   */
  public get depth() {
    const { depth = 0 } = this.props;
    return Math.max(0, Math.min(depth, 3));
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        flex: 1,
        maxWidth: 850,
        position: 'relative',
        color: COLORS.DARK,
        overflow: 'hidden',
      }),
    };
    return <div {...css(styles.base, this.props.style)}>{this.renderSheets()}</div>;
  }

  private renderSheets() {
    const { children } = this.props;
    const depth = this.depth;

    if (depth < 2) {
      return this.renderSheet({ color: children ? 0 : 1, children });
    }

    if (depth === 2) {
      return (
        <React.Fragment>
          {this.renderSheet({ color: 0.3, top: 0, marginX: 8, height: 8, radius: 4 })}
          {this.renderSheet({ color: children ? 0 : 1, top: 8, children })}
        </React.Fragment>
      );
    }

    if (depth === 3) {
      return (
        <React.Fragment>
          {this.renderSheet({ color: 0.15, marginX: 15, height: 6, radius: 4 })}
          {this.renderSheet({ color: 0.3, top: 6, marginX: 8, height: 8, radius: 4 })}
          {this.renderSheet({ color: children ? 0 : 1, top: 14, children })}
        </React.Fragment>
      );
    }

    return null;
  }

  private renderSheet(
    args: {
      radius?: number;
      marginX?: number;
      top?: number;
      height?: number;
      color?: string | number;
      children?: React.ReactNode;
    } = {},
  ) {
    const radius = defaultValue(args.radius, 5);
    const y = defaultValue(args.top, 0);
    const x = defaultValue(args.marginX, 0);
    const bottom = typeof args.height === 'number' ? null : 0;

    const styles = {
      base: css({
        Absolute: [y, x, bottom, x],
        height: args.height,
        backgroundColor: color.format(defaultValue(args.color, 1)),
        borderRadius: `${radius}px ${radius}px 0 0`,
        display: 'flex',
      }),
    };
    return <div {...styles.base}>{args.children}</div>;
  }
}
