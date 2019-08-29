import * as React from 'react';
import { IMyContext } from './types';

import { loader } from '..';
export { loader } from '..';

loader.singleton
  .context<IMyContext>(e => {
    // Set context values that are passed through the React hierarchy here.
    e.props.foo = 'Hello';
  })
  .add('A', async () => {
    const Foo = (await import('./module.A')).ComponentA;
    return <Foo />;
  })
  .add('B', async () => {
    const getLorem = (await import('./module.B')).getLorem;
    return getLorem();
  });
