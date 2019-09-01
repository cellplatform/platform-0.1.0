import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { loader, t } from './common';
import { App } from './App';

/**
 * Configure loader.
 */
loader.singleton
  .add('A', async () => {
    const Foo = (await import('./modules/A')).ComponentA;
    return <Foo />;
  })
  .add('B', async () => {
    const getLorem = (await import('./modules/B')).getLorem;
    return getLorem();
  });

/**
 * Render into DOM.
 */
ReactDOM.render(<App />, document.getElementById('root'));
