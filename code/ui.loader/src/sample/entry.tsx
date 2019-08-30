import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { loader, t } from './common';
import { Test } from './Test';

/**
 * Configure loader.
 */
loader.singleton
  // Set context values that are passed through the React hierarchy here.
  // NB:  sample shows splitting the context creation across multiple
  //      configurations. Typically you'd do this all in one place, however
  //      you may also split the configuration across different levels of the app.
  .context<t.IMyContext>(e => {
    return { foo: 'Hello' };
  })
  .context<t.IMyContext>(e => {
    return { bar: 123 };
  })

  // Configure dynamic modules.
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
ReactDOM.render(<Test />, document.getElementById('root'));
