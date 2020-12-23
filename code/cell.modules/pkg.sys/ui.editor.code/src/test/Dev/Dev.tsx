import React, { useEffect, useState } from 'react';

import { color, css, t, rx } from '../../common';
import { CodeEditor } from '../../components/CodeEditor';
import { DevActions } from './actions';
import { DevHost } from './Dev.host';
import { crdt } from './Dev.CRDT';
import { DevProps } from './Dev.props';

const bus = rx.bus<t.CodeEditorEvent>();
// const events = CodeEditor.events(bus);

const actions = DevActions(bus);

const filename = {
  one: 'one.ts',
  two: 'foo/two.tsx',
};

crdt({ bus });

// export type DevProps = {}

export const Dev: React.FC = () => {
  const [selection, setSelection] = useState<t.CodeEditorSelection>();

  useEffect(() => {
    actions.model.event.changed$.subscribe((e) => {
      setSelection(e.to.selection);
    });
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
          <DevHost title={'<CodeEditor>: one'} filename={filename.one}>
            <CodeEditor
              focusOnLoad={true}
              bus={bus}
              id={'one'}
              filename={filename.one}
              onReady={actions.onReady}
            />
          </DevHost>
          <DevHost title={'<CodeEditor>: two'} filename={filename.two}>
            <CodeEditor bus={bus} id={'two'} filename={filename.two} onReady={actions.onReady} />
          </DevHost>
        </div>
        <div {...styles.right}>
          {actions.render({ style: { flex: 1 } })}
          {<DevProps id={actions.model.state.editor?.id} selection={selection} />}
        </div>
      </div>
    </React.StrictMode>
  );
};

export default Dev;
