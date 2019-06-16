import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import * as cli from '../cli';
import { css, CommandShell, t, ObjectView, Hr, TabStrip, ITabStripProps, color } from '../common';

export type IMyData = { name: string };

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
    const styles = {
      base: css({
        flex: 1,
        padding: 30,
        userSelect: 'none',
      }),
      vertical: css({
        width: 120,
      }),
    };

    const items = [{ name: 'One' }, { name: 'Two' }, { name: 'Three' }];

    return (
      <CommandShell cli={this.cli} tree={{}} localStorage={true}>
        <div {...styles.base}>
          <TabStrip items={items} renderTab={this.renderTab} isDraggable={this.state.isDraggable} />

          <Hr margin={'50 0'} thickness={5} />

          <div {...styles.vertical}>
            <TabStrip
              items={items}
              axis={'y'}
              renderTab={this.renderTab}
              isDraggable={this.state.isDraggable}
            />
          </div>
        </div>
      </CommandShell>
    );
  }

  private renderTab: t.TabFactory<IMyData> = e => {
    const styles = {
      base: css({ padding: 10 }),
      x:
        e.isHorizontal &&
        css({
          borderRight: !e.isLast ? `solid 1px ${color.format(-0.1)}` : undefined,
          PaddingX: 30,
        }),
      y:
        e.isVertical &&
        css({
          borderBottom: !e.isLast ? `solid 1px ${color.format(-0.1)}` : undefined,
        }),
    };
    return (
      <div {...css(styles.base, styles.x, styles.y)}>
        <div>{e.data.name}</div>
      </div>
    );
  };
}
