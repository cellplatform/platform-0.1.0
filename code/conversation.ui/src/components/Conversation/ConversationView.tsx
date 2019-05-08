import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { css, GlamorValue, log, t, value, UserIdentity } from '../../common';
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
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
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
    return this.thread.draft;
  }

  public get user() {
    return this.draft.user;
  }

  public get avatarSrc() {
    return this.user.email;
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
      <Divider key={i} height={30} left={78} marginY={0} />,
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
    const name = UserIdentity.toName(user);
    const email = UserIdentity.toEmail(user);
    const elHeader = <ThreadCommentHeader timestamp={item.timestamp} name={name} />;
    const body = item.body ? item.body.markdown : undefined;
    return <ThreadComment key={item.id} avatarSrc={email} header={elHeader} body={body} />;
  }

  private renderFooterComment() {
    const body = this.draft.markdown;
    return (
      <ThreadComment
        avatarSrc={this.avatarSrc}
        body={body}
        isEditing={true}
        editor$={this.editor$}
        onComment={this.props.onComment}
      />
    );
  }
}
