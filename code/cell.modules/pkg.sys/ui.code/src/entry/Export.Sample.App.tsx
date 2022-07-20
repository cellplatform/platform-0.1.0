import React, { useEffect } from 'react';

import { css, CssValue, rx, t } from '../common';
import { CodeEditor } from '../ui/CodeEditor';
import { DevEnv } from '../ui/DevEnv';
import { CommonEntry } from './Export.util';

type Id = string;

export type AppProps = {
  bus: t.EventBus<any>;
  staticRoot?: string;
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
        staticRoot={props.staticRoot}
        style={{ flex: 1 }}
        instance={{ bus: props.bus ?? bus }}
        text={state.text}
        language={language}
        onReady={state.onReady}
      />
    </div>
  );
};

/**
 * Default entry function.
 */
const entry: t.ModuleDefaultEntry = (bus, ctx) => {
  CommonEntry.init(bus, ctx);
  return <App bus={bus} fs={{ id: 'fs.sample', path: 'sample/markdown.md' }} />;
};

export default entry;
