import React, { useEffect, useState } from 'react';

import { color, css, t, rx } from '../../common';
import { CodeEditor } from '../../components/CodeEditor';
import { DevActions, DevModel } from './Dev.ACTIONS';
// import { DevHost } from './Dev.host';
import { crdt } from './Dev.CRDT';
import { DevProps } from './Dev.props';

import { Harness } from 'sys.ui.dev';

const bus = rx.bus<t.CodeEditorEvent>();
const actions = DevActions(bus);

const filename = {
  one: 'one.ts',
  two: 'foo/two.tsx',
};

crdt({ bus });

export const ACTIONS = [CodeEditor];
export const Dev: React.FC = () => <Harness actions={[actions.main]} />;

/**
 *
 */
export const Dev2_______: React.FC = () => {
  const [model, setModel] = useState<DevModel>();

  useEffect(() => {
    actions.model.event.changed$.subscribe((e) => setModel(actions.model.state));
  }, []); // eslint-disable-line

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
      width: 300,
      backgroundColor: color.format(-0.04),
      borderLeft: `solid 1px ${color.format(-0.08)}`,
      Flex: 'vertical-stretch-stretch',
    }),
  };

  return (
    <React.StrictMode>
      <div {...styles.base}>
        <div {...styles.left}>
          {/* <DevHost title={'<CodeEditor>: one'} filename={filename.one}> */}
          <CodeEditor
            focusOnLoad={true}
            bus={bus}
            id={'one'}
            filename={filename.one}
            onReady={actions.onReady}
          />
          {/* </DevHost> */}
          {/* <DevHost title={'<CodeEditor>: two'} filename={filename.two}> */}
          <CodeEditor
            bus={bus}
            id={'two'}
            theme={model?.theme}
            filename={filename.two}
            onReady={actions.onReady}
          />
          {/* </DevHost> */}
        </div>
        <div {...styles.right}>
          {/* {actions.renderActionPanel({ style: { flex: 1 } })} */}
          {<DevProps id={model?.editor?.id} selection={model?.selection} />}
        </div>
      </div>
    </React.StrictMode>
  );
};

export default Dev;
