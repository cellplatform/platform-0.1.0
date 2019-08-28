import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, color, GlamorValue } from '@platform/react';
import { Spinner } from '@platform/ui.spinner';

export type ITestProps = { style?: GlamorValue };
export type ITestState = {};

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
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        Absolute: 0,
        backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
        Flex: 'center-center',
      }),
    };

    return (
      <div {...styles.base}>
        <Spinner />
      </div>
    );
  }
}
