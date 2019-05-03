import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, GlamorValue, t, ThreadComment, constants } from '../common';
// import { part } from '../';

const { URL } = constants;

export type ITestProps = {};

export class Test extends React.PureComponent<ITestProps, t.ITestState> {
  public state: t.ITestState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<t.ITestState>>();

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
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
        Flex: 'start-center',
        padding: 50,
      }),
      outer: css({ width: 750 }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.outer}>
          <ThreadComment avatarUrl={URL.WOMAN_1} />
        </div>
      </div>
    );
  }
}
