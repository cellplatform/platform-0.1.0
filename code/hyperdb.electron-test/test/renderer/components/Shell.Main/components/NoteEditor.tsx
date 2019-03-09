import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil, filter, delay, debounce, debounceTime } from 'rxjs/operators';
import {
  css,
  color,
  GlamorValue,
  constants,
  COLORS,
  t,
  CommandState,
  events,
} from '../../../common';

import { Editor, EditorEvent } from '@platform/ui.editor';

export type INoteEditorProps = {
  cli: CommandState;
  db: t.ITestRendererDb;
  style?: GlamorValue;
};
export type INoteEditorState = {
  cell?: string;
};

export class NoteEditor extends React.PureComponent<INoteEditorProps, INoteEditorState> {
  public state: INoteEditorState = {};
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<INoteEditorState>>();
  private editorEvents$ = new Subject<EditorEvent>();
  private editor: Editor | undefined;
  private editorRef = (ref: Editor) => (this.editor = ref);

  /**
   * [Lifecycle]
   */

  constructor(props: INoteEditorProps) {
    super(props);
    const unmounted$ = this.unmounted$;
    this.state$.pipe(takeUntil(unmounted$)).subscribe(e => this.setState(e));
    const editorEvents$ = this.editorEvents$.pipe(takeUntil(unmounted$));
    const keydown$ = events.keyPress$.pipe(
      takeUntil(unmounted$),
      filter(e => e.isPressed),
    );

    keydown$
      // Focus editor on key command.
      .pipe(
        filter(e => e.metaKey && e.key === 'p'),
        filter(e => Boolean(this.editor && !this.editor.isFocused)),
      )
      .subscribe(e => {
        if (this.editor) {
          this.editor.focus();
        }
      });

    editorEvents$.pipe(debounceTime(300)).subscribe(e => {
      this.saveContent();
    });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Properties]
   */
  public get cell() {
    return this.state.cell || 'A1';
  }

  public get content() {
    return (this.editor && this.editor.content) || '';
  }

  /**
   * [Methods]
   */
  public async saveContent() {
    const { db } = this.props;
    const content = this.content;
    const cell = this.cell;

    const key = `cell/${cell}`;
    await db.put(key as any, content);

    console.log('key', key);
    console.log('content', content);
  }

  /**
   * [Render]
   */

  public render() {
    const styles = {
      base: css({
        flex: 1,
        Flex: 'vertical',
      }),
      top: css({
        fontFamily: constants.FONT.MONOSPACE.FAMILY,
        fontSize: 12,
        fontWeight: 'bold',
        borderBottom: `solid 1px ${color.format(-0.1)}`,
        paddingBottom: 5,
      }),
      cell: css({
        color: COLORS.CLI.MAGENTA,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <div {...styles.top}>
          <div {...styles.cell}>{this.cell}</div>
        </div>
        {this.renderEditor()}
      </div>
    );
  }

  private renderEditor() {
    const styles = {
      base: css({
        flex: 1,
        paddingTop: 10,
      }),
    };
    return <Editor ref={this.editorRef} style={styles.base} events$={this.editorEvents$} />;
  }
}
