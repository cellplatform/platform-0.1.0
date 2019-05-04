import * as React from 'react';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { css, GlamorValue, t } from '../../common';
import { TextEditor } from '../primitives';

const MARKDOWN = `
Dear **Foo**
---
- one
- two
- three

`;

export type IEditorProps = { style?: GlamorValue; value?: string };
export type IEditorState = {
  editorState?: t.EditorState;
  value?: string;
};

export class Editor extends React.PureComponent<IEditorProps, IEditorState> {
  public state: IEditorState = { value: this.props.value };
  private unmounted$ = new Subject();
  private state$ = new Subject<Partial<IEditorState>>();
  private events$ = new Subject<t.TextEditorEvent>();

  // private editor!: TextEditor;
  // private editorRef = (ref: TextEditor) => (this.editor = ref);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    const events$ = this.events$.pipe(takeUntil(this.unmounted$));
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));

    events$
      // AFTER change.
      .pipe(
        filter(e => e.type === 'EDITOR/changed'),
        map(e => e.payload as t.ITextEditorChanged),
      )
      .subscribe(e => {
        const { state } = e;
        this.state$.next({
          editorState: state.to,
          value: e.value.to,
        });
      });
  }

  public componentDidUpdate(prev: IEditorProps) {
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
   * [Render]
   */
  public render() {
    const styles = {
      base: css({
        flex: 1,
        Scroll: true,
        padding: 12,
      }),
    };
    return (
      <div {...css(styles.base, this.props.style)}>
        <TextEditor value={this.state.value} events$={this.events$} />
      </div>
    );
  }
}
