import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, GlamorValue, t, s, defaultValue } from '../../common';
import { sortable } from './sortable';

export type ITabStripProps<D = any> = {
  axis?: t.TabstripAxis;
  items: D[];
  renderTab: t.TabFactory;
  debounce?: number;
  isDraggable?: boolean;
  style?: GlamorValue;
};
export type ITabStripState = {};

export class TabStrip extends React.PureComponent<ITabStripProps, ITabStripState> {
  public state: ITabStripState = {};
  private state$ = new Subject<Partial<ITabStripState>>();
  private unmounted$ = new Subject<{}>();

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
   * [Properties]
   */
  public get axis() {
    return this.props.axis || 'x';
  }

  public get isDraggable() {
    return defaultValue(this.props.isDraggable, true);
  }

  /**
   * [Render]
   */
  public render() {
    const { items = [], renderTab } = this.props;
    const distance = defaultValue(this.props.debounce, 10);
    const axis = this.axis;
    const total = items.length;
    const { List } = sortable({ axis, renderTab, total });
    return (
      <div {...css(this.props.style)}>
        <List
          axis={axis}
          lockAxis={axis}
          distance={distance}
          items={items}
          shouldCancelStart={this.onShouldCancelStart}
        />
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private onShouldCancelStart = () => !this.isDraggable;

  private onSortEnd = (sort: s.SortEnd, e: s.SortEvent) => {
    console.group('🌳 END');
    console.log('sort', sort);
    console.log('event', e);
    console.groupEnd();
  };
}
