import MonacoEditorCore, { EditorDidMount } from '@monaco-editor/react';
import React, { useEffect, useRef } from 'react';

import { css, t, DEFAULT, CssValue, time } from '../../common';
import { Monaco } from '../Monaco.api';

export type MonacoEditorReadyEvent = { instance: E };
export type MonacoEditorReadyEventHandler = (e: MonacoEditorReadyEvent) => void;

type E = t.IMonacoStandaloneCodeEditor;

export type MonacoEditorProps = {
  language?: string;
  theme?: t.CodeEditorTheme;
  loading?: React.ReactNode;
  style?: CssValue;
  onReady?: MonacoEditorReadyEventHandler;
};

/**
 * Vanilla [Monaco] editor.
 *
 * Refs:
 *    https://github.com/suren-atoyan/monaco-react
 *    https://microsoft.github.io/monaco-editor/api
 *
 */
export const MonacoEditor: React.FC<MonacoEditorProps> = (props = {}) => {
  const editorRef = useRef<E>();
  const { language = DEFAULT.LANGUAGE.TS, theme = DEFAULT.THEME } = props;

  const onMount: EditorDidMount = async (getEditorValue, instance) => {
    editorRef.current = instance;
    time.delay(0, () => {
      // NB: Wait for tick to ensure any DOM manipulation via API is applied.
      if (props.onReady) {
        props.onReady({ instance });
      }
    });
  };

  useEffect(() => {
    Monaco.singleton(); // Ensure the (singleton) API is initialized and configured.
  });

  const styles = {
    base: css({ Absolute: 0 }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      <MonacoEditorCore
        language={language}
        theme={theme}
        editorDidMount={onMount}
        loading={props.loading}
        options={{
          minimap: { enabled: true },
        }}
      />
    </div>
  );
};

/**
 * Default export.
 */
export default MonacoEditor;
