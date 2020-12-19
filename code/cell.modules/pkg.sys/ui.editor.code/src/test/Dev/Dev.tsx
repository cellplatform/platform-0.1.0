import React from 'react';
import { Subject } from 'rxjs';
import { Host } from 'sys.ui.harness';

import { color, css, t } from '../../common';
import { CodeEditor } from '../../components/CodeEditor';
import { MonacoEditor } from '../../components/Monaco';
import { actions } from './Dev.actions';

const event$ = new Subject<t.CodeEditorEvent>();
event$.subscribe((e) => {
  console.group('🌳');
  console.log('type', e.type);
  console.log('payload:', e.payload);
  console.groupEnd();
});

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
          <DevHost title={'MonacoEditor'}>
            <MonacoEditor />
          </DevHost>
          <DevHost title={'CodeEditor'}>
            <CodeEditor focusOnLoad={true} event$={event$} id={'two'} />
          </DevHost>
        </div>
        <div {...styles.right}>{actions.render({ style: { flex: 1 } })}</div>
      </div>
    </React.StrictMode>
  );
};

export type DevHostProps = { title?: string };
export const DevHost: React.FC<DevHostProps> = (props) => {
  const styles = {
    host: css({ flex: 1 }),
  };
  return (
    <Host
      style={styles.host}
      layout={{
        label: { topLeft: 'sys.ui.editor.code', topRight: props.title },
        position: { absolute: [50, 80] },
        border: -0.1,
        cropmarks: -0.2,
        background: 1,
      }}
    >
      {props.children}
    </Host>
  );
};

export default Dev;
