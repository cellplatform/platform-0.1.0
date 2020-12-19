import React, { useEffect, useRef } from 'react';

import { CssValue, t } from '../../common';
import { Loading } from '../Loading';
import { Monaco, MonacoEditor, MonacoEditorReadyEvent } from '../Monaco';

export type CodeEditorProps = {
  id?: string;
  theme?: t.CodeEditorTheme;
  language?: t.CodeEditorLanguage;
  focusOnLoad?: boolean;
  filename?: string;
  style?: CssValue;
  event$?: t.Subject<t.CodeEditorEvent>;
};

export const CodeEditor: React.FC<CodeEditorProps> = (props) => {
  const { theme } = props;
  const editorRef = useRef<t.IMonacoInstance>();

  const onReady = (e: MonacoEditorReadyEvent) => {
    const editor = Monaco.editor({
      singleton: e.singleton,
      instance: e.instance,
      id: props.id,
      filename: props.filename,
      event$: props.event$,
    });

    editorRef.current = editor;

    // TEMP 🐷
    // editor.value = 'const a:number[] = [1,2,3]';

    if (props.focusOnLoad) {
      editor.focus();
    }
  };

  useEffect(() => {
    // Clean up.
    () => {
      editorRef.current?.dispose();
    };
  });

  const elLoading = <Loading theme={theme} />;
  return <MonacoEditor style={props.style} theme={theme} loading={elLoading} onReady={onReady} />;
};
