import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import * as cli from '../cli';
import { log, Button, css, CommandShell, t, value, Hr } from '../common';
import { Icons } from './Icons';

export type ITestProps = {};

export class Test extends React.PureComponent<ITestProps, t.ITestState> {
  public state: t.ITestState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<t.ITestState>>();
  private cli: t.ICommandState = cli.init({ state$: this.state$ });

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
    const isEnabled = value.defaultValue(this.state.isEnabled, true);
    const styles = {
      base: css({
        flex: 1,
        padding: 30,
      }),
      iconContent: css({
        Flex: 'horizontal-center-center',
      }),
    };
    return (
      <CommandShell cli={this.cli} tree={{}} localStorage={true}>
        <div {...styles.base}>
          <Button label={'Click Me'} onClick={this.handleClick} isEnabled={isEnabled} />

          <Hr />

          <Button isEnabled={isEnabled} margin={[0, 20, 0, 0]}>
            <div {...styles.iconContent}>
              <Icons.Face />
              <div>Foo</div>
            </div>
          </Button>
          <Button isEnabled={isEnabled}>
            <div {...styles.iconContent}>
              <Icons.Face />
              <div>Bar</div>
            </div>
          </Button>
        </div>
      </CommandShell>
    );
  }

  private handleClick = () => {
    log.info('click');
  };
}
