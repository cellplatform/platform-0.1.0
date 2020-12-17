import React from 'react';
import { MonacoEditor } from '../components/Monaco';
import { t, StateObject, css, color } from '../common';

import { Host, Actions } from 'sys.ui.harness';

type M = { count: number };
type Ctx = { model: t.IStateObjectWritable<M> };

const model = StateObject.create<M>({ count: 0 });

console.log('__CELL__', __CELL__);

const actions = Actions<Ctx>()
  .context((prev) => prev || { model })
  .button('foo', () => null);

export const Dev: React.FC = () => {
  const styles = {
    base: css({
      Absolute: 0,
      Flex: 'horizontal-stretch-stretch',
    }),
    left: css({
      position: 'relative',
      flex: 1,
    }),
    right: css({
      display: 'flex',
      width: 300,
      backgroundColor: color.format(-0.04),
      borderLeft: `solid 1px ${color.format(-0.08)}`,
    }),
    host: css({ Absolute: 0 }),
  };
  return (
    <React.StrictMode>
      <div {...styles.base}>
        <div {...styles.left}>
          <Host
            style={styles.host}
            // background={-0.04}
            layout={{
              label: { topRight: 'sys.ui.editor.code' },
              position: { absolute: [150, 80] },
              border: -0.1,
              cropmarks: -0.2,
              background: 1,
            }}
          >
            <MonacoEditor />
          </Host>
        </div>
        <div {...styles.right}>{actions.render({ style: { flex: 1 } })}</div>
      </div>
    </React.StrictMode>
  );
};

export default Dev;
