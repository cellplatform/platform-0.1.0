import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Test } from './Test';
import { shell, t } from './common';

/**
 * Configure loader.
 */
shell.loader
  .add('A', async () => {
    const Component = (await import('./modules/A')).ComponentA;
    return <Component />;
  })
  .add('B', async () => {
    const Component = (await import('./modules/B')).ComponentB;
    return <Component />;
  });

/**
 * Render into DOM.
 */
ReactDOM.render(<Test />, document.getElementById('root'));
