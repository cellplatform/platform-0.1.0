import * as React from 'react';

import { loader } from '..';
export { loader } from '..';

loader
  .add('A', async () => {
    const Foo = (await import('./module.A')).Foo;
    return <Foo />;
  })
  .add('B', async () => {
    const getLorem = (await import('./module.B')).getLorem;
    return getLorem();
  });
