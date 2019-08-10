import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, GlamorValue } from './common';

export type ITestProps = { style?: GlamorValue };
export type ITestState = { count?: number };

export class Test extends React.PureComponent<ITestProps, ITestState> {
  public state: ITestState = {};
  private state$ = new Subject<Partial<ITestState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get count() {
    return this.state.count || 0;
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        fontSize: 50,
        PaddingX: 50,
        PaddingY: 15,
      }),
      image: css({ borderRadius: 8 }),
    };
    return (
      <div {...css(styles.base, this.props.style)} onClick={this.handleClick}>
        <div>Count: {this.count || 0}</div>
        <img src='/images/cat.jpg' {...styles.image} />
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private handleClick = () => {
    this.state$.next({ count: this.count + 1 });
  };
}
