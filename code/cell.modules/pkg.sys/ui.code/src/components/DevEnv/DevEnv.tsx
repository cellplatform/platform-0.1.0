import React, { useState } from 'react';
import { css, CssValue, t, m, COLORS } from './common';
import { Icons } from '../Icons';
import {} from 'sys.ui.dev';

import { Test } from 'sys.ui.dev/lib/web.ui/TestSuite';
import { TestSuiteRunResponse } from 'sys.ui.dev/lib/types';

import { CodeEditor } from '../CodeEditor';

export type DevEnvProps = {
  bus: t.EventBus;
  theme?: t.CodeEditorTheme;
  language?: t.CodeEditorLanguage;
  results?: TestSuiteRunResponse;
  focusOnLoad?: boolean;
  filename?: string;
  style?: CssValue;
  onReady?: m.DevEnvReadyHandler;
};

export const DevEnv: React.FC<DevEnvProps> = (props) => {
  const { bus, results } = props;
  const [editor, setEditor] = useState<t.CodeEditorInstance>();

  /**
   * Render
   */
  const styles = {
    base: css({
      boxSizing: 'border-box',
      position: 'relative',
      Flex: 'vertical-stretch-stretch',
      color: COLORS.DARK,
    }),
    body: {
      base: css({ Flex: 'horizontal-stretch-stretch', flex: 1 }),
      left: css({ flex: 1, position: 'relative' }),
      right: css({ flex: 1, position: 'relative' }),
    },
    footer: {
      base: css({
        padding: 6,
        backgroundColor: COLORS.CLI.YELLOW,
        Flex: 'horizontal-spaceBetween-center',
      }),
    },
    warning: {
      base: css({ Flex: 'horizontal-center-center', fontSize: 11 }),
      icon: css({ marginRight: 6, opacity: 0.6 }),
      label: css({ opacity: 0.7 }),
    },
  };

  const elBody = (
    <div {...styles.body.base}>
      <div {...styles.body.left}>
        <CodeEditor
          bus={bus}
          theme={props.theme}
          language={props.language}
          focusOnLoad={props.focusOnLoad}
          filename={props.filename}
          onReady={(e) => {
            setEditor(e.editor);
            props.onReady?.({ editor: e.editor.events });
          }}
        />
      </div>
      <div {...styles.body.right}>
        <Test.View.Results padding={20} scroll={true} data={results} />
      </div>
    </div>
  );

  const elFooter = (
    <div {...styles.footer.base}>
      <div {...styles.warning.base}>
        <Icons.Warning style={styles.warning.icon} size={18} color={COLORS.DARK} />
        <div {...styles.warning.label}>
          Warning: Unsafe {'"eval"'} language structure in use. Do not use in production.
        </div>
      </div>
      <div></div>
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elBody}
      {elFooter}
    </div>
  );
};
