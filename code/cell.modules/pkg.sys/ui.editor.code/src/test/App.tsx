import React from 'react';
import { Editor } from '../components/Editor';
import { css } from '@platform/css';

import { Host } from 'sys.ui.harness/src/components/Host';

console.log('React.version', React.version);

export const App: React.FC = () => {
  const styles = {
    base: css({
      Absolute: 0,
    }),
  };
  return (
    <React.StrictMode>
      <Editor />
      {/* <Host style={styles.base} layout={{ width: 400, height: 400 }}>
      </Host> */}
    </React.StrictMode>
  );
};
