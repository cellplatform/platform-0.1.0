import React, { useState } from 'react';
import { TestSuiteRunResponse } from 'sys.ui.dev/lib/types';

import { CodeEditor } from '../CodeEditor';
import { COLORS, css, CssValue, t } from './common';
import { FooterWarning } from './ui/Footer.Warning';
import { TestResultsView } from './ui/View.TestResults';
import { JsonView } from './ui/View.Json';

export type DevEnvProps = {
  bus: t.EventBus;
  theme?: t.CodeEditorTheme;
  language?: t.CodeEditorLanguage;
  text?: string;
  results?: TestSuiteRunResponse;
  focusOnLoad?: boolean;
  filename?: string;
  style?: CssValue;
  onReady?: t.DevEnvReadyHandler;
};

export const DevEnv: React.FC<DevEnvProps> = (props) => {
  const { bus, results, language } = props;
  const [editor, setEditor] = useState<t.CodeEditorInstance>();

  const isCode = language === 'javascript' || language === 'typescript';
  const isJson = language === 'json';

  /**
   * Render
   */
  const styles = {
    base: css({
      position: 'relative',
      boxSizing: 'border-box',
      Flex: 'vertical-stretch-stretch',
      color: COLORS.DARK,
    }),
    body: {
      base: css({ Flex: 'horizontal-stretch-stretch', flex: 1 }),
      left: css({ flex: 1, position: 'relative' }),
      right: css({ flex: 1, position: 'relative', display: 'flex' }),
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
        {isCode && <TestResultsView results={results} style={{ flex: 1 }} />}
        {isJson && <JsonView text={props.text} style={{ flex: 1 }} />}
      </div>
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elBody}
      {isCode && <FooterWarning />}
    </div>
  );
};
