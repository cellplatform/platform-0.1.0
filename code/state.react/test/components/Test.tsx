import * as React from 'react';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  color,
  Button,
  ObjectView,
  CommandShell,
  css,
  GlamorValue,
  t,
  COLORS,
  tools,
} from '../common';
import { Child } from './Test.Child';

import { Provider, store } from '../store';
import * as cli from '../cli';

export type ITestProps = {};
export type ITestState = {};

export class Test extends React.PureComponent<ITestProps, ITestState> {
  public state: ITestState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ITestState>>();
  private cli!: t.ICommandState;

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
    this.cli = cli.init({});
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
      base: css({ flex: 1, Flex: 'horizontal' }),
      left: css({
        flex: 1,
        padding: 30,
      }),
      right: css({
        width: 300,
        backgroundColor: COLORS.DARK,
        borderBottom: `solid 1px ${color.format(0.15)}`,
        display: 'flex',
      }),
    };
    return (
      <Provider>
        <CommandShell cli={this.cli} tree={{}}>
          <div {...styles.base}>
            <div {...styles.left}>
              <Child>
                <Child />
              </Child>
            </div>
            <div {...styles.right}>
              <tools.Panel store={store} />
            </div>
          </div>
        </CommandShell>
      </Provider>
    );
  }
}
