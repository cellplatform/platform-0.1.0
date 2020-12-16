import MonacoEditorCore, { EditorDidMount } from '@monaco-editor/react';
import React, { useEffect, useRef } from 'react';

import { constants, t } from '../../common';
import { Monaco } from './api.Monaco';

const MONACO = constants.MONACO;

export type MonacoEditorProps = {
  language?: string;
  theme?: string;
};

/**
 * Vanilla [Monaco] editor.
 * Refs:
 *    https://github.com/suren-atoyan/monaco-react
 *    https://microsoft.github.io/monaco-editor/api
 */
export const MonacoEditor: React.FC<MonacoEditorProps> = (props = {}) => {
  const { language = MONACO.LANGUAGE.TS, theme = MONACO.THEME } = props;
  const editorRef = useRef<t.IMonacoStandaloneCodeEditor>();

  const onMount: EditorDidMount = async (getEditorValue, editor) => {
    editorRef.current = editor;
  };

  useEffect(() => {
    // Ensure the (singleton) API is initialized and configured.
    Monaco.singleton();

    return () => {
      // Cleanup.
    };
  });

  return <MonacoEditorCore language={language} theme={theme} editorDidMount={onMount} />;
};

export default MonacoEditor;
