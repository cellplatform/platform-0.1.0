import React from 'react';
import { Editor } from '../components/Editor';
import { css } from '@platform/css';

import { Host } from 'sys.ui.harness/src/components/Host';

export const Dev: React.FC = () => {
  const styles = {
    host: css({ Absolute: 0 }),
  };
  return (
    <React.StrictMode>
      <Host
        style={styles.host}
        background={-0.04}
        layout={{
          label: { topRight: 'sys.ui.editor.code' },
          position: { absolute: [150, 80] },
          border: -0.1,
          cropmarks: -0.2,
          background: 1,
        }}
      >
        <Editor />
      </Host>
    </React.StrictMode>
  );
};

export default Dev;
