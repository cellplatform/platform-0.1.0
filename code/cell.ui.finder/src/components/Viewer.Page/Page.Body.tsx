import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, CssValue, defaultValue } from '../../common';

export type IPageBodyProps = {
  backgroundColor?: string | number;
  paddingX?: number;
  paddingY?: number;
  marginY?: number;
  style?: CssValue;
};
export type IPageBodyState = {};

export class PageBody extends React.PureComponent<IPageBodyProps, IPageBodyState> {
  public state: IPageBodyState = {};
  private state$ = new Subject<Partial<IPageBodyState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: IPageBodyProps) {
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
    const backgroundColor = color.format(defaultValue(this.props.backgroundColor, 1));
    const PaddingX = defaultValue(this.props.paddingX, 50);
    const PaddingY = defaultValue(this.props.paddingY, 50);
    const MarginY = defaultValue(this.props.marginY, 0);

    const styles = {
      base: css({
        position: 'relative',
        boxSizing: 'border-box',
        backgroundColor,
        PaddingX,
        PaddingY,
        MarginY,
      }),
    };

    return <div {...css(styles.base, this.props.style)}>{this.props.children}</div>;
  }
}
