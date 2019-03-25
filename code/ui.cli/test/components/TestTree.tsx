import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, GlamorValue } from '../common';

export type ITestTreeProps = { style?: GlamorValue };
export type ITestTreeState = {};

export class TestTree extends React.PureComponent<ITestTreeProps, ITestTreeState> {
  public state: ITestTreeState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ITestTreeState>>();

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Render]
   */
  public render() {
    const styles = { base: css({}) };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div>TestTree</div>
      </div>
    );
  }
}
