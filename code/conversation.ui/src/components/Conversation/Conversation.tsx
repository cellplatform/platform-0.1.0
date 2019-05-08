import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

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

  private view!: ConversationView;
  private viewRef = (ref: ConversationView) => (this.view = ref);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    const { context } = this.props;
    const dispatch$ = this.dispatch$.pipe(takeUntil(this.unmounted$));
    const store$ = context.changed$.pipe(takeUntil(this.unmounted$));

    context.changed$.subscribe(e => this.forceUpdate());
    dispatch$.subscribe(e => context.dispatch(e));

    const focus$ = store$.pipe(filter(e => e.event.type === 'THREAD/focus'));

    focus$
      // Focus.
      .pipe(filter(e => e.to.ui.focus === 'DRAFT'))
      .subscribe(e => this.focus());

    focus$
      // Blur.
      .pipe(filter(e => e.to.ui.focus === undefined))
      .subscribe(e => this.focus(false));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get isFocused() {
    return this.view ? this.view.isFocused : false;
  }

  public get model() {
    return this.props.context.state;
  }

  public get draft() {
    return this.model.ui.draft;
  }

  public get user() {
    return this.draft.user;
  }

  /**
   * [Methods]
   */
  public focus(isFocused?: boolean) {
    if (this.view) {
      this.view.focus(isFocused);
    }
    return this;
  }

  /**
   * [Render]
   */
  public render() {
    return (
      <ConversationView
        ref={this.viewRef}
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
