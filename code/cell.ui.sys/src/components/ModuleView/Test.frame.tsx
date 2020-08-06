import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, CssValue, t } from '../../common';
import { Button } from '../primitives';

export type ITestFrameProps = { style?: CssValue };
export type ITestFrameState = t.Object;

export class TestFrame extends React.PureComponent<ITestFrameProps, ITestFrameState> {
  public state: ITestFrameState = {};
  private state$ = new Subject<Partial<ITestFrameState>>();
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
    const styles = { base: css({}) };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div>TestFrame</div>
        <Button>Foo</Button>
      </div>
    );
  }
}
