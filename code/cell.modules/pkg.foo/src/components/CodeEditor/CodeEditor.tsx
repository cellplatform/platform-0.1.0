import * as React from 'react';
// import Editor from '@monaco-editor/react';

console.log('FOO react', React.version);

type O = Record<string, unknown>;
export type ICodeEditorProps = O;
export type ICodeEditorState = O;

export class CodeEditor extends React.PureComponent<ICodeEditorProps, ICodeEditorState> {
  /**
   * [Lifecycle]
   */

  /**
   * [Render]
   */
  public render() {
    return <div>hello code editor</div>;
    // return <Editor height="90vh" language="javascript" />;
  }
}

// export default CodeEditor;
// export const CodeEditor = () => <Editor height="90vh" language="javascript" />;
