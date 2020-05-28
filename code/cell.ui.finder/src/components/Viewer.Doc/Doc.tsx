import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, css, CssValue } from '../../common';
import { DocPage } from './Doc.Page';
import { Tmp } from './Tmp';

export type IDocProps = { style?: CssValue };
export type IDocState = {};

export class Doc extends React.PureComponent<IDocProps, IDocState> {
  public state: IDocState = {};
  private state$ = new Subject<Partial<IDocState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: IDocProps) {
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
        Absolute: 0,
        overflow: 'hidden',
      }),
      highlight: css({
        Absolute: [0, null, 0, 0],
        width: 12,
        backgroundColor: color.format(0.1),
      }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        {this.renderBackground({})}
        {this.renderBackground({ blur: 5 })}
        <div {...styles.highlight} />
        {this.renderBody()}
      </div>
    );
  }

  private renderBackground(args: { blur?: number } = {}) {
    const styles = {
      base: css({
        Absolute: -10,
        backgroundImage: `url(https://images.unsplash.com/photo-1465056836041-7f43ac27dcb5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=3151&q=80)`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        filter: args.blur ? `blur(${args.blur}px)` : undefined,
      }),
    };
    return <div {...styles.base}></div>;
  }

  private renderBody() {
    const styles = {
      base: css({ Absolute: 0 }),
      page: css({
        Absolute: [20, 40, 0, 40],
        display: 'flex',
        justifyContent: 'center',
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.page}>
          <DocPage>
            <Tmp />
          </DocPage>
        </div>
      </div>
    );
  }
}
