import { Editor, EditorEvent } from '@platform/ui.editor';
import * as React from 'react';
import { Subject, Observable } from 'rxjs';
import { map, debounceTime, filter, takeUntil } from 'rxjs/operators';
import { updateWatch } from '../../../cli/cmd.watch';

import {
  color,
  COLORS,
  CommandState,
  constants,
  css,
  events,
  GlamorValue,
  t,
} from '../../../common';
import * as cli from '../../../cli';

export type INoteEditorProps = {
  cli: CommandState;
  db: t.ITestRendererDb;
  style?: GlamorValue;
};
export type INoteEditorState = {
  cellKey?: string;
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

  // constructor(props: INoteEditorProps) {

  // }

  public componentDidMount() {
    // const { db } = this.props;
    const unmounted$ = this.unmounted$;
    this.state$.pipe(takeUntil(unmounted$)).subscribe(e => this.setState(e));
    const editorEvents$ = this.editorEvents$.pipe(takeUntil(unmounted$));
    // const dbWatch$ = db.watch$.pipe(takeUntil(unmounted$));
    const commandEvents$ = cli.events$.pipe(takeUntil(unmounted$));
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

    commandEvents$
      .pipe(
        filter(e => e.type === 'CLI/editor/cell'),
        map(e => e.payload as cli.ICliEditorCellEvent['payload']),
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

  public get content() {
    return (this.editor && this.editor.content) || '';
  }

  /**
   * [Methods]
   */

  public async saveContent() {
    const { db } = this.props;
    const content = this.content;
    const key = this.cellDbKey;
    await db.put(key as any, content);
    await updateWatch({ db, addKeys: [key] });
  }

  public async changeCell(cellKey: string) {
    const { db } = this.props;
    this.state$.next({ cellKey });

    const key = this.cellDbKey as any;
    const content = (await db.get(key)).value;

    console.group('🌳 ');
    console.log('change', cellKey);
    console.log('content', content);
    console.groupEnd();

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
    return <Editor ref={this.editorRef} style={styles.base} events$={this.editorEvents$} />;
  }
}
