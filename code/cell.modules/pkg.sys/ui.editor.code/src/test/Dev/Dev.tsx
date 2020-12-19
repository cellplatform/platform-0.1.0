import React from 'react';
import { Subject } from 'rxjs';

import { color, css, t } from '../../common';
import { CodeEditor } from '../../components/CodeEditor';
import { actions } from './Dev.actions';
import { DevHost } from './Dev.host';

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

  const filename = {
    one: 'one.ts',
    two: 'foo/two.tsx',
  };

  return (
    <React.StrictMode>
      <div {...styles.base}>
        <div {...styles.left}>
          <DevHost title={'<CodeEditor>'} filename={filename.one}>
            <CodeEditor focusOnLoad={true} event$={event$} id={'one'} filename={filename.one} />
          </DevHost>
          <DevHost title={'<CodeEditor>'} filename={filename.two}>
            <CodeEditor focusOnLoad={true} event$={event$} id={'two'} filename={filename.two} />
          </DevHost>
        </div>
        <div {...styles.right}>{actions.render({ style: { flex: 1 } })}</div>
      </div>
    </React.StrictMode>
  );
};

export default Dev;
