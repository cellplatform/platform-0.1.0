import * as React from 'react';
import { css, color } from '../common';
import { ObjectView } from './primitives';
import { Editor } from './Editor';

export const Test = () => {
  const styles = {
    base: css({
      Absolute: 0,
      boxSizing: 'border-box',
      display: 'flex',
    }),
    columns: css({
      margin: 20,
      Flex: 'horizontal-stretch-stretch',
      flex: 1,
    }),
    left: css({
      flex: 1,
      border: `solid 1px ${color.format(-0.1)}`,
      display: 'flex',
    }),
    right: css({
      marginLeft: 15,
      width: 300,
    }),
    editor: css({ flex: 1, padding: 10 }),
  };

  const data = { foo: 123 };

  return (
    <div {...styles.base}>
      <div {...styles.columns}>
        <div {...styles.left}>
          <Editor style={styles.editor} />
        </div>
        <div {...styles.right}>
          <ObjectView name={'state'} data={data} />
        </div>
      </div>
    </div>
  );
};
