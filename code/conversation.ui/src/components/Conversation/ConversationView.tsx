import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil, debounceTime } from 'rxjs/operators';

import { css, GlamorValue, log, t, UserIdentityType } from '../../common';
import { Divider } from '../Divider';
import { ThreadComment } from '../ThreadComment';
import { ThreadCommentHeader } from '../ThreadCommentHeader';

export type IConversationViewProps = {
  model: t.IThreadStoreModel;
  dispatch$: Subject<t.ThreadEvent>;
  style?: GlamorValue;
  onComment?: (e: {}) => void;
};

export class ConversationView extends React.PureComponent<IConversationViewProps> {
  private unmounted$ = new Subject();
  private editor$ = new Subject<t.TextEditorEvent>();
  private dispatch = (e: t.ThreadEvent) => this.props.dispatch$.next(e);

  private draftComment!: ThreadComment;
  private draftCommentRef = (ref: ThreadComment) => (this.draftComment = ref);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    const editor$ = this.editor$.pipe(takeUntil(this.unmounted$));
    const editorChanged$ = editor$.pipe(
      filter(e => e.type === 'EDITOR/changed'),
      map(e => e.payload as t.ITextEditorChanged),
    );

    editorChanged$.subscribe(e => {
      const markdown = e.value.to;
      const user = this.user;
      const draft = markdown ? { user, markdown } : { user };
      this.dispatch({ type: 'THREAD/draft', payload: { draft } });
    });

    const focus$ = editor$.pipe(
      filter(e => e.type === 'EDITOR/focus'),
      map(e => e.payload as t.ITextEditorFocus),
    );

    focus$
      // Keep state in sync when editor is manually focused.
      .pipe(
        filter(e => e.isFocused),
        debounceTime(0),
        filter(e => this.thread.ui.focus !== 'DRAFT'),
      )
      .subscribe(e => this.dispatch({ type: 'THREAD/focus', payload: { target: 'DRAFT' } }));

    focus$
      // Keep state in sync when editor is manually blurred.
      .pipe(
        filter(e => !e.isFocused),
        debounceTime(0),
        filter(e => this.thread.ui.focus === 'DRAFT'),
      )
      .subscribe(e => this.dispatch({ type: 'THREAD/focus', payload: { target: undefined } }));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get isFocused() {
    return this.draftComment ? this.draftComment.isFocused : false;
  }

  public get thread() {
    return this.props.model;
  }

  public get users() {
    return this.thread.users || [];
  }

  public get items() {
    return this.thread.items;
  }

  public get draft() {
    return this.thread.ui.draft;
  }

  public get user() {
    return this.draft.user;
  }

  public get avatarSrc() {
    return this.user.email;
  }

  /**
   * [Methods]
   */
  public focus(isFocused?: boolean) {
    if (this.draftComment) {
      this.draftComment.focus(isFocused);
    }
    return this;
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        flex: 1,
        Flex: 'vertical-stretch-stretch',
      }),
      body: css({
        paddingTop: 20,
        flex: 1,
      }),
    };

    const elItems = this.items.map((item, i) => [
      this.renderItem(item),
      <Divider key={i} height={40} left={78} marginY={0} />,
    ]);

    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.body}>
          {elItems}
          {this.renderFooterComment()}
        </div>
      </div>
    );
  }

  private renderItem(item: t.ThreadItem) {
    switch (item.kind) {
      case 'THREAD/comment':
        return this.renderThreadComment(item);

      default:
        log.warn(`Item of kind '${item.kind}' not supported.`);
        return null;
    }
  }

  private renderThreadComment(item: t.IThreadComment) {
    const user = this.users.find(u => u.id === item.user);
    const name = UserIdentityType.toName(user);
    const email = UserIdentityType.toEmail(user);
    const elHeader = <ThreadCommentHeader timestamp={item.timestamp} name={name} />;
    const body = item.body ? item.body.markdown : undefined;
    return <ThreadComment key={item.id} avatarSrc={email} header={elHeader} body={body} />;
  }

  private renderFooterComment() {
    const body = this.draft.markdown;
    return (
      <ThreadComment
        ref={this.draftCommentRef}
        avatarSrc={this.avatarSrc}
        body={body}
        isEditing={true}
        editor$={this.editor$}
        onComment={this.props.onComment}
      />
    );
  }
}
