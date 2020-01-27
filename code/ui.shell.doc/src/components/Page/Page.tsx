import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { COLORS, css, color, CssValue } from '../../common';

export type IPageMargin = {
  color: string;
  opacity: number;
  left: number;
};

export type IPageProps = {
  pageMargin?: Partial<IPageMargin>;
  children?: React.ReactNode;
  style?: CssValue;
};
export type IPageState = {};

export class Page extends React.PureComponent<IPageProps, IPageState> {
  public state: IPageState = {};
  private state$ = new Subject<Partial<IPageState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: IPageProps) {
    super(props);
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  private get pageMargin(): IPageMargin {
    const DEFAULT: IPageMargin = { color: '#FF257B', opacity: 0.25, left: 70 };
    return { ...DEFAULT, ...this.props.pageMargin };
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        position: 'relative',
        border: `solid 1px ${color.format(-0.15)}`,
        borderBottom: 'none',
        backgroundColor: COLORS.WHITE,
        borderRadius: '3px 3px 0 0',
        boxSizing: 'border-box',
        boxShadow: `0 0 12px 0 ${color.format(-0.15)}`,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        {this.renderMargin()}
        {this.renderBody()}
        {this.renderHeader()}
      </div>
    );
  }

  private renderHeader() {
    const styles = {
      base: css({
        borderRadius: '3px 3px 0 0',
        borderBottom: `solid 1px ${color.format(-0.1)}`,
        Absolute: [0, 0, null, 0],
        height: 40,
        backgroundColor: color.format(0.9),
      }),
    };
    return (
      <div {...styles.base}>
        <div />
      </div>
    );
  }

  private renderBody() {
    const styles = {
      base: css({
        Absolute: [0, 0, 0, this.pageMargin.left + 22],
        paddingTop: 50,
        paddingRight: 45,
        paddingBottom: 50,
        Scroll: true,
      }),
    };
    return <div {...styles.base}>{this.props.children}</div>;
  }

  private renderMargin() {
    const margin = this.pageMargin;
    const left = margin.left;
    const styles = {
      base: css({
        Absolute: [0, null, 0, left],
        borderLeft: `solid 1px ${margin.color}`,
        opacity: margin.opacity,
      }),
    };
    return [
      <div key={1} {...styles.base} />,
      <div key={2} {...css(styles.base, { left: left + 2 })} />,
    ];
  }
}
