import * as React from 'react';

import { Command, t } from '../common';
import { TestGridView } from '../components/Test.Grid.view';

type P = t.ITestCommandProps & { ref: TestGridView; count: number };

/**
 * The root of the CLI application.
 */
export const grid = Command.create<P>('g', e => {
  const ref = (ref: TestGridView) => {
    if (ref) {
      e.set('ref', ref);
    }
  };

  const el = <TestGridView ref={ref} editorType={'default'} style={{ Absolute: 0 }} />;
  e.props.state$.next({ el, view: 'foo' });

  console.log('ns/count:', e.get('count'), e.command.name);
}).add('focus', e => {
  e.get('ref').datagrid.focus();
});
