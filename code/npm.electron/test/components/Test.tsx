import { CommandPrompt } from '@platform/ui.cli';
import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { init as initCommandLine } from '../cli';
import { COLORS, css, t, renderer } from '../common';

/**
 * Test Component
 */
export class Test extends React.PureComponent<{}, t.ITestState> {
  public state: t.ITestState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<t.ITestState>>();
  private cli = initCommandLine({ state$: this.state$ });

  public static contextType = renderer.Context;
  public context!: renderer.ReactContext;

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
        Flex: 'vertical',
      }),
      main: css({
        position: 'relative',
        display: 'flex',
        flex: 1,
        padding: 20,
      }),
      footer: css({
        backgroundColor: COLORS.DARK,
      }),
    };

    return (
      <div {...styles.base}>
        <div {...styles.main}>
          <div>body</div>
        </div>
        <div {...styles.footer}>
          <CommandPrompt cli={this.cli} theme={'DARK'} />
        </div>
      </div>
    );
  }
}
