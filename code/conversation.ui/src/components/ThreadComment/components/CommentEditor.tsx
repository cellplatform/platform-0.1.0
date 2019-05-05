import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { css, color, GlamorValue, t } from '../../../common';
import * as buttons from '../../buttons';
import { TextEditor } from '../../primitives';

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
    return !Boolean((this.state.value || '').trim());
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
      <div {...css(styles.base, this.props.style)}>
        <TextEditor value={this.state.value} events$={this.props.editor$} />
      </div>
    );
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
    };

    const isEnabled = !this.isEmpty;

    return (
      <div {...styles.base}>
        <div>{/* left */}</div>
        <div>
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
}
