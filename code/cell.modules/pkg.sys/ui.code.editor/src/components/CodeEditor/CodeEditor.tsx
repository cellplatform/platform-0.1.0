import React, { useEffect, useRef } from 'react';

import { CssValue, t, rx, time } from '../../common';
import { Loading } from '../Loading';
import { Monaco, MonacoEditor, MonacoEditorReadyEvent } from '../Monaco';
import { CodeEditorInstance } from '../../api';

export type CodeEditorProps = {
  id?: string;
  theme?: t.CodeEditorTheme;
  language?: t.CodeEditorLanguage;
  focusOnLoad?: boolean;
  filename?: string;
  style?: CssValue;
  bus?: t.EventBus<any>;
  onReady?: t.CodeEditorReadyEventHandler;
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

    if (props.onReady) {
      props.onReady({ id: editor.id, editor });
    }

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

  return (
    <MonacoEditor
      style={props.style}
      theme={theme}
      loading={elLoading}
      onReady={onReady}
      bus={bus}
    />
  );
};
