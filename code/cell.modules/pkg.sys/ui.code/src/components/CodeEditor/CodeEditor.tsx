import React, { useEffect, useRef, useState } from 'react';

import { CssValue, t, rx, DEFAULT, css } from '../../common';
import { Loading } from '../Loading';
import { MonacoEditor, MonacoEditorReadyEvent } from '../Monaco';
import { CodeEditorInstance } from '../../api';

type InstanceId = string;

export type CodeEditorProps = {
  id?: InstanceId;
  theme?: t.CodeEditorTheme;
  language?: t.CodeEditorLanguage;
  focusOnLoad?: boolean;
  filename?: string;
  style?: CssValue;
  bus?: t.EventBus<any>;
  onReady?: t.CodeEditorReadyEventHandler;
};

export const CodeEditor: React.FC<CodeEditorProps> = (props) => {
  const editorRef = useRef<t.CodeEditorInstance>();
  const bus = rx.bus<t.CodeEditorEvent>(props.bus);

  const [isReady, setIsReady] = useState<boolean>(false);
  const [theme, setTheme] = useState<t.CodeEditorTheme>();

  const onReady = (e: MonacoEditorReadyEvent) => {
    const editor = CodeEditorInstance.create({
      singleton: e.singleton,
      instance: e.instance,
      id: props.id,
      filename: props.filename,
      bus,
    });

    editorRef.current = editor;

    if (props.onReady) props.onReady({ id: editor.id, editor });
    if (props.focusOnLoad) editor.focus();

    // HACK: Theme not being applied until load finished.
    setTheme(DEFAULT.THEME);
    setIsReady(true);
  };

  useEffect(() => {
    // Clean up.
    () => editorRef.current?.dispose();
  });

  useEffect(() => {
    setTheme(props.theme);
  }, [props.theme]);

  const elLoading = !isReady && <Loading theme={props.theme || DEFAULT.THEME} />;

  const styles = {
    base: css({ Absolute: 0 }),
    editor: css({
      display: isReady ? 'block' : 'none',
    }),
  };

  return (
    <div {...css(styles.base, props.style)}>
      {elLoading}
      <MonacoEditor theme={theme} onReady={onReady} bus={bus} style={styles.editor} />
    </div>
  );
};
