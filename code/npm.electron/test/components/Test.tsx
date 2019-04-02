import { CommandPrompt } from '@platform/ui.cli';
import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { init as commandLine } from '../cli';
import { COLORS, css, t, renderer, Button, Hr, Npm } from './common';

/**
 * Test Component
 */
export class Test extends React.PureComponent<{}, t.ITestState> {
  public state: t.ITestState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<t.ITestState>>();

  public static contextType = renderer.Context;
  public context!: renderer.ReactContext;
  public npm!: Npm;
  public cli!: t.ICommandState;

  /**
   * [Lifecycle]
   */

  public componentWillMount() {
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));

    this.npm = Npm.create({ ipc: this.context.ipc });
    this.cli = commandLine({ state$: this.state$, npm: this.npm });
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
          <div>Body</div>
        </div>
        <div {...styles.footer}>
          <CommandPrompt cli={this.cli} theme={'DARK'} />
        </div>
      </div>
    );
  }

  private button(label: string, handler: () => void) {
    return <Button label={label} onClick={handler} />;
  }
}
