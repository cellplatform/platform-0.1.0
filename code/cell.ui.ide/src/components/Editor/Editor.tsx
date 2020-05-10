import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, color, CssValue } from '@platform/react';

import Ed from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

import * as themes from '../../themes';

type Theme = monaco.editor.IStandaloneThemeData;

// import { monaco as m } from '@monaco-editor/react';

// m.init()
//   .then(foo => {
//     // foo.editor.defineTheme('monokai', themes.dark as Theme);
//     foo.editor.setTheme('monokai');
//     console.log('monaco', foo);
//   })
//   .catch(error => console.error('An error occurred during initialization of Monaco: ', error));

const BG = {
  DARK: themes.dark.colors['editor.background'],
};

export type IEditorProps = { style?: CssValue };
export type IEditorState = {};

export class Editor extends React.PureComponent<IEditorProps, IEditorState> {
  public state: IEditorState = {};
  private state$ = new Subject<Partial<IEditorState>>();
  private unmounted$ = new Subject<{}>();

  /**
   * [Lifecycle]
   */
  constructor(props: IEditorProps) {
    super(props);
  }

  public componentDidMount() {
    this.state$.pipe(takeUntil(this.unmounted$)).subscribe(e => this.setState(e));
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
        Absolute: [0, 0, 0, 0],
        backgroundColor: BG.DARK,
      }),
    };
    return (
      <div {...styles.base}>
        <Ed
          language={'typescript'}
          editorDidMount={this.editorDidMount}
          // onChange={this.onChange}
          theme={'dark'}
        />
      </div>

      // <div {...css(styles.base, this.props.style)}>
      //   <div>Editor</div>
      // </div>
    );
  }

  private editorDidMount = (
    getEditorValue: () => string,
    editor: monaco.editor.IStandaloneCodeEditor,
  ) => {
    console.log('editor', editor);
    this.editor = editor;

    editor.onDidChangeModelContent(e => {
      console.log('e', e);
    });
  };

  private editor!: monaco.editor.IStandaloneCodeEditor;
  // private nameRef = (ref: Type) => this.name = ref;

  // private onChange = (
  //   e: monacoEditor.editor.IModelContentChangedEvent,
  //   value: string | undefined,
  // ) => {
  //   console.group('🌳 change');
  //   console.log('e', e);
  //   console.log('value', value);

  //   console.groupEnd();

  //   return 'hello';
  // };
}
