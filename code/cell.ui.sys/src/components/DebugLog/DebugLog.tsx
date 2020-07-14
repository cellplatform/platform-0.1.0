import * as React from 'react';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { color, css, CssValue, t, ui } from '../../common';
import { DebugLogToolbar } from './DebugLog.Toolbar';
import { VirtualList, VirtualListFactory, VirtualListItemSize } from '../VirtualList';
import { DebugLogItem } from './DebugLog.Item';
import * as d from './types';
import { DebugLogInfoPanel } from './DebugLog.InfoPanel';

import { StateObject } from '../../state';

export type IDebugLogProps = {
  event$: Observable<t.Event<any>>;
  style?: CssValue;
};

export class DebugLog extends React.PureComponent<IDebugLogProps, Partial<d.IDebugLogState>> {
  public state: d.IDebugLogState = { total: 0, items: [] };
  private store = StateObject.create<d.IDebugLogState>(this.state);
  private unmounted$ = new Subject();

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    this.store.changed$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e.to));

    const event$ = this.props.event$.pipe(takeUntil(this.unmounted$));
    event$.subscribe((e) => {
      this.add(e);
    });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  public add(e: t.Event) {
    // NB: Doing this with unshift and storing `total` for efficiency when the array get long.
    const count = this.total + 1;
    this.store.change((draft) => {
      draft.items.unshift({ count, data: e });
      if (draft.selectedIndex === undefined) {
        draft.selectedIndex = 0;
      }
      if (draft.selectedIndex !== 0) {
        draft.selectedIndex++;
      }
    });
    this.updateState();
  }

  /**
   * [Properties]
   */
  public get items() {
    return this.store.state.items || [];
  }

  public get total() {
    return this.state.total || 0;
  }

  public get selected() {
    const { selectedIndex } = this.state;
    return selectedIndex === undefined ? undefined : this.items[selectedIndex];
  }

  /**
   * [Methods]
   */
  public updateState() {
    this.store.change((draft) => {
      draft.items = this.items;
      draft.total = this.items.length;
    });
  }

  public clear() {
    this.store.change((draft) => {
      draft.selectedIndex = undefined;
      draft.items = [];
      draft.total = 0;
    });
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        position: 'relative',
        backgroundColor: color.format(1),
        Flex: 'vertical-stretch-stretch',
      }),
      body: css({
        flex: 1,
        Flex: 'horizontal-stretch-stretch',
        position: 'relative',
      }),
    };

    const isEmpty = this.total === 0;

    return (
      <div {...css(styles.base, this.props.style)}>
        <DebugLogToolbar onClearClick={this.onClearClick} />
        <div {...styles.body}>
          {isEmpty && this.renderEmpty()}
          {!isEmpty && this.renderList()}
          {!isEmpty && this.renderInfoPanel()}
        </div>
      </div>
    );
  }

  private renderEmpty() {
    if (this.total > 0) {
      return null;
    }
    const styles = {
      base: css({
        flex: 1,
        fontStyle: 'italic',
        fontSize: 12,
        opacity: 0.6,
        textAlign: 'center',
        paddingTop: 20,
      }),
    };
    return (
      <div {...styles.base}>
        <div>No items to display.</div>
      </div>
    );
  }

  private renderList() {
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

  private renderInfoPanel() {
    const styles = {
      base: css({
        position: 'relative',
        borderLeft: `solid 1px ${color.format(-0.1)}`,
        flex: 1,
      }),
    };

    const item = this.selected;
    return <div {...styles.base}>{item && <DebugLogInfoPanel item={item} />}</div>;
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
      <DebugLogItem
        index={index}
        item={item}
        store={this.store}
        style={props.style}
        onClick={this.rowClickHandler(index, item)}
      />
    );
  };

  private rowClickHandler = (index: number, item: d.IDebugLogItem) => {
    return () => {
      this.store.change((draft) => (draft.selectedIndex = index));
    };
  };

  /**
   * [Handlers]
   */
  private onClearClick = () => {
    this.clear();
  };
}
