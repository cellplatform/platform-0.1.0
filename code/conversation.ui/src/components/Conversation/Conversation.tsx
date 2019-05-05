import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, takeUntil, map } from 'rxjs/operators';

import { css, GlamorValue, state, t, log, id as idUtil } from '../../common';
import { ThreadComment } from '../ThreadComment';
import { Divider } from '../Divider';
import { ThreadCommentHeader } from '../ThreadCommentHeader';

export type IConversationProps = { style?: GlamorValue };
export type IConversationState = {
  nextId?: string;
};

const TEMP = {
  WOMAN_1: require('../../../static/images/woman-1.jpg'),
  WOMAN_2: require('../../../static/images/woman-2.jpg'),
};

export class Conversation extends React.PureComponent<IConversationProps, IConversationState> {
  public state: IConversationState = { nextId: idUtil.cuid() };
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<IConversationState>>();
  private editor$ = new Subject<t.TextEditorEvent>();

  public static contextType = state.Context;
  public context!: state.ReactContext;
  public store = this.context.getStore<t.IThreadModel, t.ThreadEvent>();

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    const store = this.store;
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    const store$ = this.store.changed$.pipe(takeUntil(this.unmounted$));
    const editor$ = this.editor$.pipe(takeUntil(this.unmounted$));
    const editorChanged$ = editor$.pipe(
      filter(e => e.type === 'EDITOR/changed'),
      map(e => e.payload as t.ITextEditorChanged),
    );

    state$.subscribe(e => this.setState(e));
    store$.subscribe(e => this.forceUpdate());

    editorChanged$.subscribe(e => {
      const markdown = e.value.to;
      const draft = markdown ? { markdown } : undefined;
      store.dispatch({ type: 'THREAD/draft', payload: { draft } });
    });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get items() {
    return this.store.state.items;
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

    const elItems = this.items
      .map((item, i) => [this.renderItem(item), <Divider key={i} height={25} left={78} />])
      .flat();

    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.body}>
          {elItems}
          {this.renderNextComment()}
        </div>
      </div>
    );
  }

  private renderItem(item: t.ThreadItem) {
    switch (item.kind) {
      case 'THREAD/comment':
        const elHeader = <ThreadCommentHeader timestamp={item.timestamp} />;
        return <ThreadComment key={item.id} avatarUrl={TEMP.WOMAN_1} header={elHeader} />;

      default:
        log.warn(`Item of kind '${item.kind}' not supported.`);
        return null;
    }
  }

  private renderNextComment() {
    const draft = this.store.state.draft;
    const body = draft ? draft.markdown : undefined;
    return (
      <ThreadComment
        key={this.state.nextId}
        avatarUrl={TEMP.WOMAN_1}
        body={body}
        isEditing={true}
        editor$={this.editor$}
      />
    );
  }
}
