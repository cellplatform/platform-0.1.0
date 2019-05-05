import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { css, color, GlamorValue, t } from '../../../common';
import * as buttons from '../../buttons';
import { TextEditor } from '../../primitives';
import { Icons } from '../../Icons';

export type ICommentEditorProps = {
  editor$: Subject<t.TextEditorEvent>;
  value?: string;
  style?: GlamorValue;
};
export type ICommentEditorState = {
  editorState?: t.EditorState;
  value?: string;
};

export class CommentEditor extends React.PureComponent<ICommentEditorProps, ICommentEditorState> {
  public state: ICommentEditorState = { value: this.props.value };
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ICommentEditorState>>();

  private editor!: TextEditor;
  private editorRef = (ref: TextEditor) => (this.editor = ref);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    const editor$ = this.props.editor$.pipe(takeUntil(this.unmounted$));
    const changed$ = editor$.pipe(
      filter(e => e.type === 'EDITOR/changed'),
      map(e => e.payload as t.ITextEditorChanged),
    );

    state$.subscribe(e => this.setState(e));

    editor$.subscribe(e => {
      // console.log('e', e);
    });

    changed$.subscribe(e => {
      // console.log('changed', e);
    });
  }

  public componentDidUpdate(prev: ICommentEditorState) {
    const { value } = this.props;
    if (prev.value !== value) {
      this.state$.next({ value });
    }
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get isEmpty() {
    return !Boolean(this.state.value);
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        position: 'relative',
      }),
      editor: css({
        position: 'relative',
        padding: 3,
      }),
      toolbar: css({
        borderTop: `solid 1px ${color.format(-0.1)}`,
        backgroundColor: color.format(-0.01),
        PaddingX: 15,
        PaddingY: 10,
      }),
    };

    return (
      <div {...styles.base}>
        {this.renderEditor()}
        {this.renderEditorToolbar()}
      </div>
    );
  }

  private renderEditor() {
    const styles = {
      base: css({
        position: 'relative',
        flex: 1,
        padding: 15,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)} onClick={this.focusOnClick}>
        {this.isEmpty && this.renderPlaceholder()}
        <TextEditor ref={this.editorRef} value={this.state.value} events$={this.props.editor$} />
      </div>
    );
  }

  private renderPlaceholder(args: { text?: string } = {}) {
    const { text = 'Leave a comment.' } = args;
    const styles = {
      base: css({
        Absolute: [18, null, null, 16],
        pointerEvents: 'none',
        fontSize: '14',
        fontStyle: 'italic',
        opacity: 0.3,
      }),
    };
    return <div {...styles.base}>{text}</div>;
  }

  private renderEditorToolbar() {
    const BUTTON_WIDTH = 100;
    const styles = {
      base: css({
        borderTop: `solid 1px ${color.format(-0.1)}`,
        backgroundColor: color.format(-0.01),
        padding: 8,
        Flex: 'horiziontal-center-spaceBetween',
      }),
      left: css({ paddingLeft: 5 }),
      right: css({}),
    };

    const isEnabled = !this.isEmpty;

    return (
      <div {...styles.base}>
        <div {...styles.left}>
          <Icons.Markdown size={20} />
        </div>
        <div {...styles.right}>
          <buttons.HoverGrey
            label={'Cancel'}
            minWidth={BUTTON_WIDTH}
            margin={[null, 5, null, null]}
          />
          <buttons.Blue label={'Comment'} minWidth={BUTTON_WIDTH} isEnabled={isEnabled} />
        </div>
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private focusOnClick = () => {
    if (this.editor) {
      this.editor.focus();
    }
  };
}
