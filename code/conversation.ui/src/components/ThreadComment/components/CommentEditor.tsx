import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, GlamorValue, t } from '../../../common';
import { Editor } from '../../Editor';
import * as buttons from '../../buttons';

export type ICommentEditorProps = {
  editor$: Subject<t.TextEditorEvent>;
  markdown?: string;
  style?: GlamorValue;
};
export type ICommentEditorState = {};

export class CommentEditor extends React.PureComponent<ICommentEditorProps, ICommentEditorState> {
  public state: ICommentEditorState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<ICommentEditorState>>();

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */
  public render() {
    const { markdown = '' } = this.props;
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
        <div {...styles.editor}>
          <Editor value={markdown} events$={this.props.editor$} />
        </div>
        {this.renderEditorToolbar()}
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
    return (
      <div {...styles.base}>
        <div>{/* left */}</div>
        <div>
          <buttons.HoverGrey
            label={'Cancel'}
            minWidth={BUTTON_WIDTH}
            margin={[null, 5, null, null]}
          />
          <buttons.Blue label={'Comment'} minWidth={BUTTON_WIDTH} />
        </div>
      </div>
    );
  }
}
