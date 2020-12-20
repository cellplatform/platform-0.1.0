import React, { useEffect, useRef } from 'react';

import { CssValue, t, rx } from '../../common';
import { Loading } from '../Loading';
import { Monaco, MonacoEditor, MonacoEditorReadyEvent } from '../Monaco';
import { CodeEditorInstance } from '../../api.CodeEditor';

export type CodeEditorProps = {
  id?: string;
  theme?: t.CodeEditorTheme;
  language?: t.CodeEditorLanguage;
  focusOnLoad?: boolean;
  filename?: string;
  style?: CssValue;
  bus?: t.EventBus<any>;
};

export const CodeEditor: React.FC<CodeEditorProps> = (props) => {
  const { theme } = props;
  const editorRef = useRef<t.CodeEditorInstance>();
  const bus = rx.bus<t.CodeEditorEvent>(props.bus);

  const onReady = (e: MonacoEditorReadyEvent) => {
    const editor = CodeEditorInstance.create({
      singleton: e.singleton,
      instance: e.instance,
      id: props.id,
      filename: props.filename,
      bus,
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
