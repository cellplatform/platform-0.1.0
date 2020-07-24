import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { css, CssValue } from '../../common';
import { VirtualList, VirtualListFactory, VirtualListItemSize } from '../VirtualList';
import { LogItem } from './Log.Item';
import * as t from './types';

export type ILogListProps = {
  store: t.IDebugLogWrite;
  style?: CssValue;
};

export class LogList extends React.PureComponent<ILogListProps> {
  private unmounted$ = new Subject();

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    this.store.event.changed$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.forceUpdate());
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get store() {
    return this.props.store;
  }

  public get items() {
    return this.store.state.items || [];
  }

  public get total() {
    return this.store.state.total || 0;
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        position: 'relative',
        flex: 1,
        fontSize: 14,
      }),
      list: css({ Absolute: 0 }),
    };
    return (
      <div {...styles.base}>
        <VirtualList
          factory={this.rowFactory}
          itemSize={this.rowHeight}
          total={this.total}
          style={styles.list}
        />
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private rowHeight: VirtualListItemSize = (index: number) => {
    return 30;
  };

  private rowFactory: VirtualListFactory = (props) => {
    const index = props.index;
    const item = this.items[index];
    return (
      <LogItem
        index={index}
        item={item}
        store={this.store}
        style={props.style}
        onClick={this.rowClickHandler(index, item)}
      />
    );
  };

  private rowClickHandler = (index: number, item: t.IDebugLogItem) => {
    return () => {
      this.store.change((draft) => (draft.selectedIndex = index));
    };
  };
}
