import React from 'react';
import { css, CssValue } from '../../common';

export type CodeEditorProps = { style?: CssValue };

export const CodeEditor: React.FC<CodeEditorProps> = (props) => {
  const styles = { base: css({}) };
  return <div {...css(styles.base, props.style)}>CodeEditor</div>;
};
