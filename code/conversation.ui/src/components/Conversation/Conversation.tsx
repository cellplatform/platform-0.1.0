import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { GlamorValue, t, time } from '../../common';
import { ConversationView } from './ConversationView';

export type IConversationProps = {
  context: t.IThreadStoreContext;
  style?: GlamorValue;
};

export class Conversation extends React.PureComponent<IConversationProps> {
  private unmounted$ = new Subject();
  private dispatch$ = new Subject<t.ThreadEvent>();
  private dispatch = (e: t.ThreadEvent) => this.dispatch$.next(e);

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
   * [Properties]
   */
  public get model() {
    return this.props.context.state;
  }

  public get draft() {
    return this.model.draft;
  }

  public get user() {
    return this.draft.user;
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
        onComment={this.handleCommentClick}
      />
    );
  }

  /**
   * Handlers
   */

  private handleCommentClick = () => {
    const user = this.user;
    const markdown = this.draft.markdown || '';
    const item: t.IThreadComment = {
      kind: 'THREAD/comment',
      id: '',
      timestamp: time.toTimestamp(),
      user: user.id,
      body: { markdown },
    };
    this.dispatch({ type: 'THREAD/add', payload: { user, item } });
  };
}
