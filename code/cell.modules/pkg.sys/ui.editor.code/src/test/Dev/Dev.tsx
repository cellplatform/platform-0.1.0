import React from 'react';
import { Host } from 'sys.ui.harness';

import { color, css } from '../../common';
import { MonacoEditor } from '../../components/Monaco';
import { actions } from './Dev.actions';

export const Dev: React.FC = () => {
  const styles = {
    base: css({
      Absolute: 0,
      Flex: 'horizontal-stretch-stretch',
    }),
    left: css({
      position: 'relative',
      flex: 1,
      Flex: 'vertical-stretch-stretch',
    }),
    right: css({
      display: 'flex',
      width: 300,
      backgroundColor: color.format(-0.04),
      borderLeft: `solid 1px ${color.format(-0.08)}`,
    }),
  };
  return (
    <React.StrictMode>
      <div {...styles.base}>
        <div {...styles.left}>
          <DevHost />
          <DevHost />
        </div>
        <div {...styles.right}>{actions.render({ style: { flex: 1 } })}</div>
      </div>
    </React.StrictMode>
  );
};

const DevHost: React.FC = () => {
  const styles = {
    host: css({ flex: 1 }),
  };
  return (
    <Host
      style={styles.host}
      // background={-0.04}
      layout={{
        label: { topRight: 'sys.ui.editor.code' },
        position: { absolute: [50, 80] },
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      }}
    >
      <MonacoEditor />
    </Host>
  );
};

export default Dev;
