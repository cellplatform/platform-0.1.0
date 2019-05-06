import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { GlamorValue, t } from '../../common';
import { ConversationView } from './ConversationView';

export type IConversationProps = {
  context: t.IThreadStoreContext;
  style?: GlamorValue;
};

export class Conversation extends React.PureComponent<IConversationProps> {
  private unmounted$ = new Subject();
  private dispatch$ = new Subject<t.ThreadEvent>();

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    const { context } = this.props;
    const dispatch$ = this.dispatch$.pipe(takeUntil(this.unmounted$));

    context.changed$.subscribe(e => this.forceUpdate());
    dispatch$.subscribe(e => context.dispatch(e));
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
        model={this.props.context.state}
        dispatch$={this.dispatch$}
      />
    );
  }
}
