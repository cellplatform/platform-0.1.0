import React, { useEffect, useRef, useState } from 'react';

import { CodeEditorInstance } from '../../api';
import { Loading } from '../Loading';
import { MonacoEditor, MonacoEditorReadyEvent } from '../Monaco';
import { css, CssValue, DEFAULT, FC, LANGUAGES, rx, t } from './common';

/**
 * Types
 */
type Instance = string;

export type CodeEditorProps = {
  id?: Instance;
  bus?: t.EventBus<any>;
  theme?: t.CodeEditorTheme;
  language?: t.CodeEditorLanguage;
  focusOnLoad?: boolean;
  filename?: string;
  style?: CssValue;
  onReady?: t.CodeEditorReadyEventHandler;
};

/**
 * Component
 */
const View: React.FC<CodeEditorProps> = (props) => {
  const bus = rx.bus<t.CodeEditorEvent>(props.bus);

  const editorRef = useRef<t.CodeEditorInstance>();

  const [isReady, setReady] = useState<boolean>(false);
  const [theme, setTheme] = useState<t.CodeEditorTheme>();

  /**
   * Handlers
   */
  const onReady = (e: MonacoEditorReadyEvent) => {
    const { id, filename } = props;
    const { singleton, instance } = e;

    const editor = CodeEditorInstance.create({ singleton, instance, id, filename, bus });
    editorRef.current = editor;

    props.onReady?.({ id: editor.id, editor });
    if (props.focusOnLoad) editor.focus();

    // HACK: Theme not being applied until load has completed.
    setTheme(DEFAULT.THEME);
    setReady(true);
  };

  /**
   * Lifecycle
   */
  useEffect(() => {
    () => editorRef.current?.dispose(); // Clean up.
  }, []);

  useEffect(() => setTheme(props.theme), [props.theme]);

  useEffect(() => {
    const language = props.language ?? DEFAULT.LANGUAGE.TS;
    editorRef.current?.events.model.set.language(language);
  }, [props.language]);

  /**
   * Render
   */

  const styles = {
    base: css({ Absolute: 0 }),
    editor: css({ display: isReady ? 'block' : 'none' }),
  };

  const elLoading = !isReady && <Loading theme={props.theme || DEFAULT.THEME} />;

  return (
    <div {...css(styles.base, props.style)}>
      {elLoading}
      <MonacoEditor theme={theme} onReady={onReady} bus={bus} style={styles.editor} />
    </div>
  );
};

/**
 * Export
 */

type Fields = {
  languages: t.CodeEditorLanguage[];
};
export const CodeEditor = FC.decorate<CodeEditorProps, Fields>(
  View,
  { languages: LANGUAGES },
  { displayName: 'CodeEditor' },
);
