import * as React from 'react';

import { Command, css, t } from '../common';
import { DataGrid, TestGridView } from '../components/Test.Grid.view';

type P = t.ITestCommandProps & { ref: TestGridView; count: number };

let datagrid: DataGrid | undefined;
const ref = (ref: TestGridView) => {
  if (ref) {
    datagrid = ref.datagrid;
  }
};

/**
 * The root of the CLI application.
 */
export const grid = Command.create<P>('g', e => {
  const styles = { base: css({ Absolute: 0 }) };
  const el = <TestGridView ref={ref} editorType={'default'} style={styles.base} />;
  e.props.state$.next({ el, view: 'foo' });

  e.set('count', 123);
  console.log('ns/count:', e.get('count'));
})
  .add('focus', e => {
    console.log('focus/count:', e.get('count'));
    if (datagrid) {
      datagrid.focus();
    }
  })
  .add('count', e => {
    console.log('count:', e.get('count'));
  });
