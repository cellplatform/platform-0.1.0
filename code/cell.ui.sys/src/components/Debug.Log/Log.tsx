import * as React from 'react';
import { Observable, Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

import { color, css, CssValue, time, ui, defaultValue, StateObject } from '../../common';
import { LogInfoPanel } from './Log.InfoPanel';
import { LogList } from './Log.List';
import { LogToolbar } from './Log.Toolbar';
import * as t from './types';

export type IDebugLogProps = {
  event$: Observable<t.Event<any>>;
  emptyMessage?: React.ReactNode;
  style?: CssValue;
};

export class Log extends React.PureComponent<IDebugLogProps> {
  private store = StateObject.create<t.IDebugLogState>({
    total: 0,
    items: [],
    isEnabled: true,
  });
  private unmounted$ = new Subject();

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  /**
   * [Lifecycle]
   */
  public componentDidMount() {
    this.store.changed$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.forceUpdate());

    // Add events to the list as they arrive.
    const event$ = this.props.event$.pipe(takeUntil(this.unmounted$));
    event$.pipe(filter((e) => this.isEnabled)).subscribe((e) => this.add(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  public add(e: t.Event) {
    // NB: Doing this with unshift and storing `total` for efficiency when the array get long.
    const count = this.total + 1;

    this.store.change((draft) => {
      const timestamp = time.now.timestamp;
      draft.items.unshift({ timestamp, count, data: e });

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
    return this.store.state.total || 0;
  }

  public get selected() {
    const { selectedIndex } = this.store.state;
    return selectedIndex === undefined ? undefined : this.items[selectedIndex];
  }

  public get isEnabled() {
    return this.store.state.isEnabled;
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
    const store = this.store;

    return (
      <div {...css(styles.base, this.props.style)}>
        <LogToolbar store={store} onClearClick={this.onClearClick} />
        <div {...styles.body}>
          {isEmpty && this.renderEmpty()}
          {!isEmpty && <LogList store={store} />}
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
        <div>{defaultValue(this.props.emptyMessage, 'No log items to display.')}</div>
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
    return <div {...styles.base}>{item && <LogInfoPanel item={item} />}</div>;
  }

  /**
   * [Handlers]
   */

  private onClearClick = () => {
    this.clear();
  };
}
