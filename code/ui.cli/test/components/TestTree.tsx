import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { color, COLORS, css, t } from '../../src/common';
import { CommandTree } from '../../src';
import { init as initCommandLine } from '../cli';

const cli = initCommandLine({});

/**
 * Test Component
 */
export type ITestTreeState = {
  current?: t.ICommand;
};

export class TestTree extends React.PureComponent<{}, ITestTreeState> {
  public state: ITestTreeState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ITestTreeState>>();
  private events$ = new Subject<t.CommandTreeEvent>();

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
    const events$ = this.events$.pipe(takeUntil(this.unmounted$));

    events$.subscribe(e => {
      console.log('🌳', e.type, e.payload);
    });

    events$
      .pipe(
        filter(e => e.type === 'COMMAND_TREE/current'),
        map(e => e.payload as t.ICommandTreeCurrent),
      )
      .subscribe(e => {
        this.state$.next({ current: e.command });
      });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  public render() {
    const styles = {
      base: css({
        flex: 1,
        Flex: 'horizontal',
        backgroundColor: COLORS.DARK,
      }),
      tree: css({
        width: 240,
        display: 'flex',
        borderRight: `solid 1px ${color.format(0.25)}`,
      }),
    };
    return (
      <div {...styles.base}>
        <div {...styles.tree}>
          <CommandTree
            root={cli.root}
            current={this.state.current}
            theme={'DARK'}
            background={'NONE'}
            events={this.events$}
          />
        </div>
      </div>
    );
  }
}
