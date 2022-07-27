import React, { useEffect } from 'react';

import { css, CssValue, t } from '../common';
import { CodeEditor } from '../CodeEditor';
import { DevEnv } from '../DevEnv';

type Id = string;

export type AppProps = {
  bus: t.EventBus<any>;
  fs?: { id: Id; path: string };
  allowRubberband?: boolean; // Page rubber-band effect in Chrome (default: false).
  style?: CssValue;
};

export const App: React.FC<AppProps> = (props) => {
  const { fs, bus } = props;

  const language: t.CodeEditorLanguage = 'markdown';
  const state = CodeEditor.useState({ bus, fs });

  /**
   * Lifecycle
   */
  useEffect(() => {
    const allowRubberband = props.allowRubberband ?? false;
    document.body.style.overflow = allowRubberband ? 'auto' : 'hidden';
  }, [props.allowRubberband]);

  /**
   * [Render]
   */
  const styles = {
    base: css({
      Absolute: 0,
      display: 'flex',
      overflow: 'hidden',
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <DevEnv
        style={{ flex: 1 }}
        instance={{ bus: props.bus ?? bus }}
        text={state.text}
        language={language}
        onReady={state.onReady}
      />
    </div>
  );
};
