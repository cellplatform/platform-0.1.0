import * as React from 'react';
import { Observable } from 'rxjs';

import { CssValue, IEditorSettings, ISize, monaco, value } from '../../../common';
import * as config from '../../../config';

export type IMonacoProps = {
  settings: IEditorSettings;
  size$: Observable<ISize>;
  focusOnLoad?: boolean;
  style?: CssValue;
};

export class Monaco extends React.PureComponent<IMonacoProps> {
  public editor: monaco.editor.IStandaloneCodeEditor;
  private el: HTMLDivElement | undefined;
  private elRef = (ref: HTMLDivElement) => (this.el = ref);

  public componentDidMount() {
    this.init();
  }

  public init() {
    const { settings, size$ } = this.props;
    const {
      selectOnLineNumbers,
      fontSize,
      fontFamily,
      readOnly,
      language,
      theme,
      tabSize,
      javascriptDefaults,
      typescriptDefaults,
    } = settings;

    // Configure languages.
    const typescript = monaco.languages.typescript;
    // if (javascriptDefaults) {
    //   config.configureLanguage(
    //     javascriptDefaults,
    //     typescript.javascriptDefaults,
    //   );/*  */
    // }

    // if (typescriptDefaults) {
    //   config.configureLanguage(
    //     typescriptDefaults,
    //     typescript.typescriptDefaults,
    //   );
    // }

    // Create the editor.
    const el = this.el as HTMLElement;
    const editor = (this.editor = monaco.editor.create(el, {
      language,
      selectOnLineNumbers,
      fontSize,
      fontFamily,
      readOnly,
      minimap: { enabled: false },
    }));
    size$.subscribe(() => this.editor.layout());

    // Set initial focus.
    const focusOnLoad = value.defaultValue(this.props.focusOnLoad, true);
    if (focusOnLoad) {
      this.focus();
    }

    // Perform configuration.
    config.configureTheme(theme);
    config.configureTabSize(editor, tabSize);
  }

  public componentWillUnmount() {
    this.editor.dispose();
  }

  public render() {
    return <div ref={this.elRef} {...this.props.style} />;
  }

  public focus() {
    if (this.editor) {
      this.editor.focus();
    }
  }
}
