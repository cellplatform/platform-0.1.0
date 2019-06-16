import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { GlamorValue, t, value } from '../common';
import { SplitPanel } from './SplitPanel';
import { Panel } from './Panel';

export type IStoreProps = {
  store: t.IStoreContext;
  layout?: 'SINGLE' | 'SPLIT';
  name?: string;
  expandPaths?: string | string[];
  maxActions?: number;
  style?: GlamorValue;
};
export type IStoreState = {
  total?: number;
  events?: t.IStoreEvent[];
};

export class Store extends React.PureComponent<IStoreProps, IStoreState> {
  public state: IStoreState = {};
  private state$ = new Subject<Partial<IStoreState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    const store$ = this.store.changed$.pipe(takeUntil(this.unmounted$));

    state$.subscribe(e => this.setState(e));
    store$.subscribe(() => this.forceUpdate());

    store$.subscribe(e => {
      const total = (this.state.total || 0) + 1;
      let events = [...(this.state.events || []), e.event];
      const max = this.maxActions;
      events = events.length > max ? events.splice(events.length - max) : events;
      this.state$.next({ total, events });
    });
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

  public get data() {
    return this.store.state;
  }

  public get maxActions() {
    const defaultValue = this.layout === 'SINGLE' ? 10 : 50;
    return value.defaultValue(this.props.maxActions, defaultValue);
  }

  public get actions() {
    const actions = this.state.events || [];
    const max = this.maxActions;
    return actions.length > max ? actions.slice(actions.length - max) : actions;
  }

  public get layout() {
    const { layout = 'SINGLE' } = this.props;
    return layout;
  }

  /**
   * [Render]
   */
  public render() {
    const layout = this.layout;
    const data = this.data;
    const total = this.state.total || 0;
    const actions = this.actions;

    if (layout === 'SPLIT') {
      return (
        <SplitPanel
          actions={actions}
          data={data}
          total={total}
          name={this.props.name}
          expandPaths={this.props.expandPaths}
          style={this.props.style}
        />
      );
    }

    if (layout === 'SINGLE') {
      return (
        <Panel
          actions={actions}
          data={data}
          total={total}
          name={this.props.name}
          expandPaths={this.props.expandPaths}
          style={this.props.style}
        />
      );
    }

    return null;
  }
}
