import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import * as cli from '../cli';
import { color, CommandShell, css, Hr, log, t, TabStrip } from '../common';

export type ITestProps = {};

export class Test extends React.PureComponent<ITestProps, t.ITestState> {
  public state: t.ITestState = {
    items: [{ name: 'One' }, { name: 'Two' }, { name: 'Three' }],
  };
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<t.ITestState>>();
  private cli: t.ICommandState = cli.init({ state$: this.state$ });
  private events$ = new Subject<t.TabstripEvent>();

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    const events$ = this.events$.pipe(takeUntil(this.unmounted$));
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));

    events$.subscribe(e => {
      log.info('🌳', e.type, e.payload);
    });

    events$
      .pipe(
        filter(e => e.type === 'TABSTRIP/sort/complete'),
        map(e => e.payload as t.ITabstripSortComplete),
      )
      .subscribe(e => {
        this.state$.next({ items: e.items.to });
      });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */
  public render() {
    const { items = [] } = this.state;
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

    return (
      <CommandShell cli={this.cli} tree={{}} localStorage={true}>
        <div {...styles.base}>
          <TabStrip
            items={items}
            renderTab={this.renderTab}
            isDraggable={this.state.isDraggable}
            events$={this.events$}
          />

          <Hr margin={'50 0'} thickness={5} />

          <div {...styles.vertical}>
            <TabStrip
              items={items}
              axis={'y'}
              renderTab={this.renderTab}
              isDraggable={this.state.isDraggable}
              events$={this.events$}
            />
          </div>
        </div>
      </CommandShell>
    );
  }

  private renderTab: t.TabFactory<t.IMyData> = e => {
    const styles = {
      base: css({
        padding: 10,
        backgroundColor: e.isDragging ? 'rgba(255, 0, 0, 0.3)' : undefined, // NB: Not working.
      }),
      x:
        e.isHorizontal &&
        css({
          borderRight: !e.isLast && !e.isDragging ? `solid 1px ${color.format(-0.1)}` : undefined,
          PaddingX: 30,
        }),
      y:
        e.isVertical &&
        css({
          borderBottom: !e.isLast && !e.isDragging ? `solid 1px ${color.format(-0.1)}` : undefined,
        }),
    };
    return (
      <div {...css(styles.base, styles.x, styles.y)}>
        <div>{e.data.name}</div>
      </div>
    );
  };
}
