import MonacoEditor from '@monaco-editor/react';
import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

import { constants, css, CssValue, t, ui, onStateChanged } from '../../common';
import { MonacoApi } from '../Monaco.api';

const { MONACO } = constants;

export type IMonacoProps = { style?: CssValue };
export type IMonacoState = { api?: MonacoApi };

export class Monaco extends React.PureComponent<IMonacoProps, IMonacoState> {
  public static api = MonacoApi.singleton;

  public state: IMonacoState = {};
  private state$ = new Subject<Partial<IMonacoState>>();
  private unmounted$ = new Subject();
  private getEditorValue!: () => string;
  private editor: any;

  public static contextType = ui.Context;
  public context!: t.IAppContext;

  /**
   * [Lifecycle]
   */
  constructor(props: IMonacoProps) {
    super(props);
    Monaco.api(); // Ensure API is initialized and configured (singleton).
  }

  public componentDidMount() {
    const ctx = this.context;
    const changes = onStateChanged(ctx.event$, this.unmounted$);
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));

    changes
      .on('APP:IDE/text')
      .pipe(filter((e) => e.to.text !== this.value))
      .subscribe((e) => (this.value = e.to.text));
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Properties]
   */
  public get store() {
    return this.context.getState();
  }

  public get value() {
    const fn = this.getEditorValue;
    return fn ? fn() : '';
  }

  public set value(value: string) {
    this.editor.setValue(value);
  }

  /**
   * [Render]
   */
  public render() {
    const styles = {
      base: css({ Absolute: 0 }),
    };

    return (
      <div {...css(styles.base, this.props.style)}>
        <MonacoEditor
          language={MONACO.LANGUAGE}
          theme={MONACO.THEME}
          value={this.store.text}
          editorDidMount={this.editorDidMount}
        />
      </div>
    );
  }

  /**
   * [Handlers]
   */
  private editorDidMount = (getEditorValue: () => string, editor: any) => {
    this.editor = editor;
    this.getEditorValue = getEditorValue;
    editor.onDidChangeModelContent((e: any) => this.fireChange(e, getEditorValue()));
  };

  private fireChange(e: any, text: string) {
    const payload: t.IIdeEditorContentChange = {
      text,
      eol: e.eol,
      isFlush: e.isFlush,
      isRedoing: e.isRedoing,
      isUndoing: e.isUndoing,
      versionId: e.versionId,
      change: e.change,
    };
    this.context.fire({ type: 'APP:IDE/editor/contentChange', payload });
  }
}
