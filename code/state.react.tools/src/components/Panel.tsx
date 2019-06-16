import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { COLORS, css, GlamorValue, t, value } from '../common';
import { Actions } from './Actions';
import { State } from './State';

export type IPanelProps = {
  store: t.IStoreContext;
  name?: string;
  expandPaths?: string | string[];
  maxActions?: number;
  style?: GlamorValue;
};

export type IPanelState = {
  total?: number;
  events?: t.IStoreEvent[];
};

export class Panel extends React.PureComponent<IPanelProps> {
  private unmounted$ = new Subject<{}>();
  public state: IPanelState = {};
  private state$ = new Subject<Partial<IPanelState>>();

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
      const max = this.maxEvents;
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

  public get maxEvents() {
    return value.defaultValue(this.props.maxActions, 10);
  }

  public get events() {
    const actions = this.state.events || [];
    const max = this.maxEvents;
    return actions.length > max ? actions.slice(actions.length - max) : actions;
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        color: COLORS.WHITE,
        minWidth: 280,
        flex: 1,
        Flex: 'vertical',
      }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        {this.renderState()}
        {this.renderActions()}
      </div>
    );
  }

  private renderState() {
    const { name = 'state', expandPaths } = this.props;
    const styles = {
      base: css({
        position: 'relative',
        flex: 1,
      }),
      inner: css({
        Absolute: 0,
        Scroll: true,
      }),
    };

    return (
      <div {...styles.base}>
        <div {...styles.inner}>
          <State name={name} data={this.data} expandPaths={expandPaths} />
        </div>
      </div>
    );
  }

  private renderActions() {
    const total = this.state.total || 0;
    const events = this.events;
    return <Actions events={events} total={total} />;
  }
}
