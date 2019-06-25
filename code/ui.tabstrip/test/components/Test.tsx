import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import * as cli from '../cli';
import { color, CommandShell, css, Hr, log, t, TabStrip } from '../common';

const BLUE = '#0A84FF';

export type ITestProps = {};

export class Test extends React.PureComponent<ITestProps, t.ITestState> {
  public state: t.ITestState = {
    items: [
      { name: 'One' },
      { name: 'Two' },
      { name: 'Three' },
      { name: 'Four' },
      { name: 'Five' },
    ],
    selected: 0,
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

    events$.pipe(filter(e => e.type !== 'TABSTRIP/tab/mouse')).subscribe(e => {
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

    events$
      .pipe(
        filter(e => e.type === 'TABSTRIP/tab/selection'),
        map(e => e.payload as t.ITabstripSelectionChange),
      )
      .subscribe(e => {
        this.state$.next({ selected: e.to });
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
      columns: css({ Flex: 'horizontal' }),
    };

    return (
      <CommandShell cli={this.cli} tree={{}} localStorage={true}>
        <div {...styles.base}>
          <TabStrip
            items={items}
            selected={this.state.selected}
            isDraggable={this.state.isDraggable}
            tabIndex={null}
            renderTab={this.renderTab}
            events$={this.events$}
          />

          <Hr margin={'50 0'} thickness={5} />

          <div {...styles.columns}>
            {this.renderVertical()}
            {this.renderVertical()}
          </div>
        </div>
      </CommandShell>
    );
  }

  private renderVertical = () => {
    const { items = [] } = this.state;
    const styles = {
      base: css({ width: 120, marginRight: 200 }),
    };

    return (
      <div {...styles.base}>
        <TabStrip
          axis={'y'}
          items={items}
          selected={this.state.selected}
          isDraggable={this.state.isDraggable}
          renderTab={this.renderTab}
          events$={this.events$}
        />
      </div>
    );
  };

  private renderTab: t.TabFactory<t.IMyTab> = e => {
    const selectedColor = e.isFocused ? BLUE : color.format(-0.4);

    const styles = {
      base: css({
        boxSizing: 'border-box',
        padding: 10,
        // backgroundColor: e.isDragging ? 'rgba(255, 0, 0, 0.3)' : undefined, // NB: Not working.
      }),
      x:
        e.isHorizontal &&
        css({
          PaddingX: 30,
          borderRight: !e.isLast && !e.isDragging ? `solid 1px ${color.format(-0.1)}` : undefined,
          borderBottom: `solid 3px`,
          borderBottomColor: e.isSelected ? selectedColor : 'transparent',
        }),
      y:
        e.isVertical &&
        css({
          borderBottom: !e.isLast && !e.isDragging ? `solid 1px ${color.format(-0.1)}` : undefined,
          borderLeft: `solid 6px`,
          borderLeftColor: e.isSelected ? selectedColor : 'transparent',
        }),
    };
    return (
      <div {...css(styles.base, styles.x, styles.y)}>
        <div>{e.data.name}</div>
      </div>
    );
  };
}
