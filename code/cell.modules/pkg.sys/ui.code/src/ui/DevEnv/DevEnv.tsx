import React, { useState } from 'react';
import { TestSuiteRunResponse } from 'sys.ui.dev/lib/types';

import { CodeEditor } from '../CodeEditor';
import { COLORS, css, CssValue, t } from './common';
import { FooterWarning } from './ui/Footer.Warning';
import { TestResultsView } from './ui/View.TestResults';
import { JsonView } from './ui/View.Json';
import { MarkdownView } from './ui/View.Markdown';

export type DevEnvProps = {
  instance: { bus: t.EventBus<any>; id?: string };
  staticRoot?: string;
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
  const { results, language } = props;
  const [editor, setEditor] = useState<t.CodeEditorInstance>();

  const is = {
    code: language === 'javascript' || language === 'typescript',
    json: language === 'json',
    markdown: language === 'markdown',
  };

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
    fill: css({ flex: 1 }),
  };

  const elBody = (
    <div {...styles.body.base}>
      <div {...styles.body.left}>
        <CodeEditor
          instance={props.instance}
          staticRoot={props.staticRoot}
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
        {is.code && <TestResultsView results={results} style={styles.fill} />}
        {is.json && <JsonView text={props.text} style={styles.fill} />}
        {is.markdown && <MarkdownView text={props.text} style={styles.fill} />}
      </div>
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elBody}
      {is.code && <FooterWarning />}
    </div>
  );
};
