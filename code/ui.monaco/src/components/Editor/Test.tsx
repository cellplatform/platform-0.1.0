import * as React from 'react';
import { css, color } from '../../common';
import { Editor } from '.';

export const Test = () => {
  const styles = {
    base: css({
      Absolute: 0,
    }),
    editor: css({
      // Absolute: [20, 20, 20, 300],
      Absolute: 0,
      border: `solid 1px ${color.format(-0.1)}`,
    }),
  };

  return (
    <div {...styles.base}>
      <Editor style={styles.editor} settings={{ language: 'yaml' }} />
    </div>
  );
};
