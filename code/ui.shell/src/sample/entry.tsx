import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Test } from './Test';
import { loader, t } from './common';

loader.singleton
  .context<t.IMyContext>(e => {
    return { foo: 'hello', bar: 123 };
  })
  .add('A', async () => {
    const Foo = (await import('./modules/A')).ComponentA;
    return <Foo />;
  });

ReactDOM.render(<Test />, document.getElementById('root'));
