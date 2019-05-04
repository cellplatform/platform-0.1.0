import * as React from 'react';

import { log, Command, t } from '../common';

type P = t.ITestCommandProps;

/**
 * The root of the CLI application.
 */
export const shell = Command.create<P>('shell', e => {
  log.info('🌼 invoked:shell');
  e.props.next({ el: <div>Shell</div> });
}).add('tree', e => {
  const state: any = {
    ...e.props.state,
    tree: {
      ...(e.props.state.tree || {}),
      width: e.option(['width', 'w']),
      background: e.option(['background', 'bg']),
    },
  };
  e.props.next(state);
});
