import React, { useRef, useEffect } from 'react';
import { css, CssValue, t } from '../../common';
import { Loading } from '../Loading';
import { MonacoEditor, MonacoEditorReadyEvent } from '../Monaco';
import { Monaco } from '../Monaco.api';

export type CodeEditorProps = {
  id?: string;
  theme?: t.CodeEditorTheme;
  focusOnLoad?: boolean;
  style?: CssValue;
  event$?: t.Subject<t.CodeEditorEvent>;
};

export const CodeEditor: React.FC<CodeEditorProps> = (props) => {
  const { theme } = props;
  const editorRef = useRef<t.IMonacoInstance>();

  const onReady = (e: MonacoEditorReadyEvent) => {
    console.log('e', e);
    // const editor = e.instance;
    const { instance } = e;
    const editor = Monaco.editor({ instance, id: props.id, event$: props.event$ });
    editorRef.current = editor;

    const ed = editor as any;
    console.log('ed.createModel', ed.createModel);

    editor.value = 'const a:[] = [1,2,3]';

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
