import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, CssValue, defaultValue } from '../../common';

import { PageHeader, IPageHeaderProps } from './Page.Header';

export type IPageContainerProps = {
  children?: React.ReactNode;
  header?: IPageHeaderProps;
  radius?: number;
  backgroundColor?: string | number;
  style?: CssValue;
};
export type IPageContainerState = {};

export class PageContainer extends React.PureComponent<IPageContainerProps, IPageContainerState> {
  public state: IPageContainerState = {};
  private state$ = new Subject<Partial<IPageContainerState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: IPageContainerProps) {
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
    const { header } = this.props;
    const radius = defaultValue(this.props.radius, 5);
    const backgroundColor = defaultValue(this.props.backgroundColor, 0.2);
    const borderRadius = `${radius}px ${radius}px 0 0`;

    const styles = {
      base: css({
        borderRadius,
        backgroundColor,
        flex: 1,
      }),
      content: css({
        Absolute: [header ? PageHeader.height : 0, 0, 0, 0],
        Scroll: true,
      }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        {header && <PageHeader {...header} />}
        <div {...styles.content}>{this.props.children}</div>
      </div>
    );
  }
}
