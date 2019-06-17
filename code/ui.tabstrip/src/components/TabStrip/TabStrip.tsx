import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil, filter, map } from 'rxjs/operators';

import { css, defaultValue, GlamorValue, R, s, t } from '../../common';
import { sortable } from './sortable';

export type ITabStripProps<D = any> = {
  axis?: t.TabstripAxis;
  items: D[];
  renderTab: t.TabFactory;
  selected?: number;
  dragDebounce?: number;
  isDraggable?: boolean;
  events$?: Subject<t.TabstripEvent>;
  style?: GlamorValue;
};
export type ITabStripState = {};

export class TabStrip extends React.PureComponent<ITabStripProps, ITabStripState> {
  public state: ITabStripState = {};
  private state$ = new Subject<Partial<ITabStripState>>();
  private unmounted$ = new Subject<{}>();
  private events$ = new Subject<t.TabstripEvent>();
  private draggingTabIndex = -1;

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    const events$ = this.events$.pipe(takeUntil(this.unmounted$));
    const mouse$ = events$.pipe(
      filter(e => e.type === 'TABSTRIP/tab/mouse'),
      map(e => e.payload as t.ITabMouse),
    );
    const click$ = mouse$.pipe(
      filter(e => e.button === 'LEFT'),
      filter(e => e.type === 'DOWN'),
    );
    const reorder$ = events$.pipe(
      filter(e => e.type === 'TABSTRIP/sort/complete'),
      map(e => e.payload as t.ITabstripSortComplete),
    );

    // Update state.
    state$.subscribe(e => this.setState(e));

    // Bubble events.
    if (this.props.events$) {
      this.events$.subscribe(this.props.events$);
    }

    // Fire seletion-change when tab is clicked.
    click$.subscribe(e => {
      const data = e.data;
      const from = this.selected;
      const to = e.index;
      this.fire({ type: 'TABSTRIP/tab/selection', payload: { from, to, data } });
    });

    // Fire selection-change when re-ordered.
    reorder$.pipe(filter(e => e.selected.to !== this.selected)).subscribe(e => {
      const from = this.selected;
      const to = e.selected.to;
      const data = this.data(to);
      this.fire({ type: 'TABSTRIP/tab/selection', payload: { from, to, data } });
    });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get axis() {
    return this.props.axis || 'x';
  }

  public get isDraggable() {
    return defaultValue(this.props.isDraggable, true);
  }

  public get items() {
    const { items = [] } = this.props;
    return items;
  }

  public get selected() {
    return this.props.selected;
  }

  /**
   * [Methods]
   */

  public data<D = any>(index?: number): D | undefined {
    return index === undefined ? undefined : this.items[index];
  }

  private fire(e: t.TabstripEvent) {
    this.events$.next(e);
  }

  /**
   * [Render]
   */
  public render() {
    const { renderTab, selected } = this.props;
    const distance = defaultValue(this.props.dragDebounce, 10);
    const items = this.items;
    const axis = this.axis;
    const total = items.length;
    const events$ = this.events$;
    const { List } = sortable({
      axis,
      renderTab,
      total,
      selected,
      events$,
      getDraggingTabIndex: () => this.draggingTabIndex,
    });

    return (
      <div {...css(this.props.style)}>
        <List
          axis={axis}
          lockAxis={axis}
          distance={distance}
          items={items}
          shouldCancelStart={this.onShouldCancelStart}
          onSortStart={this.onSortStart}
          onSortMove={this.onSortMove}
          onSortEnd={this.onSortEnd}
          updateBeforeSortStart={this.onUpdateBeforeSortStart}
        />
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private onShouldCancelStart = (e: any) => {
    return !this.isDraggable;
  };

  private onUpdateBeforeSortStart: s.SortStartHandler = e => {
    const { index } = e;
    this.draggingTabIndex = index;
  };

  private onSortStart: s.SortStartHandler = e => {
    const { index, collection } = e;
    const data = this.data(index);
    const axis = this.axis;
    const payload: t.ITabstripSortStart = { index, collection, data, axis };
    this.fire({ type: 'TABSTRIP/sort/start', payload });
  };

  private onSortMove: s.SortMoveHandler = move => {
    return;
  };

  private onSortEnd: s.SortEndHandler = e => {
    this.draggingTabIndex = -1;
    const axis = this.axis;
    const { collection } = e;
    const index = { from: e.oldIndex, to: e.newIndex };
    const data = this.data(index.from);

    const items = {
      from: [...this.items],
      to: R.move(index.from, index.to, this.items),
    };

    const isSelected = index.from === this.selected;
    const selected = {
      from: this.selected,
      to: isSelected ? index.to : this.selected,
    };

    const payload: t.ITabstripSortComplete = { index, collection, data, axis, items, selected };

    this.fire({ type: 'TABSTRIP/sort/complete', payload });
    this.forceUpdate();
  };
}
