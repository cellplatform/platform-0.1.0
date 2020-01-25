import { TextEditor, TextEditorEvent } from '@platform/ui.editor';
import * as React from 'react';
import { Subject } from 'rxjs';
import { debounceTime, filter, map, takeUntil } from 'rxjs/operators';

import * as cli from '../../../cli';
import { updateWatch } from '../../../cli/cmd.watch';
import {
  color,
  COLORS,
  CommandState,
  constants,
  containsFocus,
  css,
  events,
  CssValue,
  t,
} from '../../../common';

export type INoteEditorProps = {
  db: t.ITestRendererDb;
  style?: CssValue;
};
export type INoteEditorState = {
  cellKey?: string;
};

export class NoteEditor extends React.PureComponent<INoteEditorProps, INoteEditorState> {
  public state: INoteEditorState = {};
  private unmounted$ = new Subject<{}>();
  private state$ = new Subject<Partial<INoteEditorState>>();
  private editorEvents$ = new Subject<TextEditorEvent>();
  private editor: TextEditor | undefined;
  private editorRef = (ref: TextEditor) => (this.editor = ref);

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
    const editorEvents$ = this.editorEvents$.pipe(takeUntil(this.unmounted$));
    const commandEvents$ = cli.events$.pipe(takeUntil(this.unmounted$));
    const keydown$ = events.keyPress$.pipe(
      takeUntil(this.unmounted$),
      filter(e => e.isPressed),
    );

    keydown$
      // Focus editor on key command.
      .pipe(
        filter(e => e.metaKey && e.key === 'j'),
        // debounceTime(0),
        // filter(e => {
        //   // if (this.editor && this.editor.isFocused) {
        //   //   return false;
        //   // }
        //   // if (document.activeElement && document.ac) {
        //   console.log('editor isFocused', this.isFocused);

        //   // }
        //   // return Boolean(this.editor && !this.editor.isFocused);
        //   // return !this.isFocused;
        //   return true;
        // }),
      )
      .subscribe(e => {
        // e.preventDefault();
        // console.group('🌳 note');
        // console.log('document.activeElement', document.activeElement);
        // console.log('this.isFocused', this.isFocused);
        // console.groupEnd();
        if (this.editor) {
          this.editor.focus();
        }
      });

    editorEvents$.pipe(debounceTime(300)).subscribe(e => {
      this.saveContent();
    });

    commandEvents$
      .pipe(
        filter(e => e.type === 'CLI/editor/cell'),
        map(e => e.payload as cli.ITestChangeEditorCellEvent['payload']),
      )
      .subscribe(e => {
        // console.log('e', e);
        this.changeCell(e.cellKey);
      });
    this.changeCell(this.cellKey);
  }

  public componentWillUnmount() {
    this.unmounted$.next();
  }

  /**
   * [Properties]
   */
  public get cellKey() {
    return this.state.cellKey || 'A1';
  }

  public get cellDbKey() {
    return `cell/${this.cellKey}`;
  }

  public get value() {
    return (this.editor && this.editor.value) || '';
  }

  public get isFocused() {
    const isEditorFocused = this.editor && this.editor.isFocused;
    return containsFocus(this) || isEditorFocused;
  }

  /**
   * [Methods]
   */

  public async saveContent() {
    const { db } = this.props;
    const content = this.value;
    const key = this.cellDbKey;
    await db.put(key as any, content);
    await updateWatch({ db, addKeys: [key] });
  }

  public async changeCell(cellKey: string) {
    const { db } = this.props;
    this.state$.next({ cellKey });

    const key = this.cellDbKey as any;
    const content = (await db.get(key)).value;

    if (this.editor) {
      this.editor.load(content || '');
    }
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
          <div {...styles.cell}>{this.cellKey}</div>
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
    return <TextEditor ref={this.editorRef} style={styles.base} events$={this.editorEvents$} />;
  }
}
