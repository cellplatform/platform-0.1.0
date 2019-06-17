import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, defaultValue, GlamorValue, R, s, t } from '../../common';
import { sortable } from './sortable';

export type ITabStripProps<D = any> = {
  axis?: t.TabstripAxis;
  items: D[];
  renderTab: t.TabFactory;
  debounce?: number;
  isDraggable?: boolean;
  events$?: Subject<t.TabstripEvent>;
  style?: GlamorValue;
};
export type ITabStripState = {
  // draggingTab?: number;
};

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
    state$.subscribe(e => this.setState(e));

    if (this.props.events$) {
      this.events$.subscribe(this.props.events$);
    }
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

  /**
   * [Methods]
   */

  public data<D = any>(index: number): D | undefined {
    return this.items[index];
  }

  private fire(e: t.TabstripEvent) {
    this.events$.next(e);
  }

  /**
   * [Render]
   */
  public render() {
    const { renderTab } = this.props;
    const distance = defaultValue(this.props.debounce, 10);
    const items = this.items;
    const axis = this.axis;
    const total = items.length;
    const { List } = sortable({
      axis,
      renderTab,
      total,
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

    const payload: t.ITabstripSortComplete = { index, collection, data, axis, items };

    this.fire({ type: 'TABSTRIP/sort/complete', payload });
    this.forceUpdate();
  };
}
