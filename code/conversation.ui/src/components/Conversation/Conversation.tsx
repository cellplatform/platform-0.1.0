import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { GlamorValue, state, t } from '../../common';
import { ConversationView } from './ConversationView';

export type IConversationProps = { style?: GlamorValue };

export class Conversation extends React.PureComponent<IConversationProps> {
  private unmounted$ = new Subject();
  private dispatch$ = new Subject<t.ThreadEvent>();

  public static contextType = state.Context;
  public context!: state.ReactContext;
  public store = this.context.getStore<t.IThreadModel, t.ThreadEvent>();

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    const store$ = this.store.changed$.pipe(takeUntil(this.unmounted$));
    const dispatch$ = this.dispatch$.pipe(takeUntil(this.unmounted$));

    store$.subscribe(e => this.forceUpdate());
    dispatch$.subscribe(e => this.store.dispatch(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */
  public render() {
    return (
      <ConversationView
        style={this.props.style}
        model={this.store.state}
        dispatch$={this.dispatch$}
      />
    );
  }
}
