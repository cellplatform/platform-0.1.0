import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { defaultValue, css, color, CssValue } from '../../common';

export type IDocPageProps = {
  children?: React.ReactNode;
  style?: CssValue;
};
export type IDocPageState = {};

export class DocPage extends React.PureComponent<IDocPageProps, IDocPageState> {
  public state: IDocPageState = {};
  private state$ = new Subject<Partial<IDocPageState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: IDocPageProps) {
    super(props);
  }

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
        flex: 1,
        maxWidth: 850,
        position: 'relative',
      }),
    };

    const { children } = this.props;

    return (
      <div {...css(styles.base, this.props.style)}>
        {this.renderSheet({ color: 0.15, marginX: 15, height: 6, radius: 4 })}
        {this.renderSheet({ color: 0.3, top: 6, marginX: 8, height: 8, radius: 4 })}
        {this.renderSheet({ color: children ? 0 : 1, top: 14, children })}
      </div>
    );
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
