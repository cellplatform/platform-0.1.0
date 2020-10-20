import '../../MonacoEnvironment';

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { t } from '../../common';

export type ICodeEditorProps = t.Object;
export type ICodeEditorState = t.Object;

export class CodeEditor extends React.PureComponent<ICodeEditorProps, ICodeEditorState> {
  public state: ICodeEditorState = {};
  private state$ = new Subject<Partial<ICodeEditorState>>();
  private unmounted$ = new Subject();

  private div!: HTMLDivElement;
  private divRef = (ref: HTMLDivElement) => (this.div = ref);

  /**
   * [Lifecycle]
   */

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe((e) => this.setState(e));

    const value = `
function x() {
  console.log("Hello world!");
;
`;

    monaco.editor.create(this.div, {
      value,
      language: 'typescript',
    });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */
  public render() {
    const style = { width: 800, height: 600, border: `solid 1px ` };
    return <div ref={this.divRef} style={style} />;
  }
}
