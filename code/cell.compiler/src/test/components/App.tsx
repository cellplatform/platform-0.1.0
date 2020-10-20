import React from 'react';
import { ISystem, System } from './System';

/**
 * Test Application
 * See:
 *    https://github.com/module-federation/module-federation-examples/tree/master/dynamic-system-host
 */
export const App = () => {
  const [system, setSystem] = React.useState<ISystem>();

  function setFoo() {
    setSystem({
      url: 'http://localhost:3001/remoteEntry.js',
      scope: 'foo',
      module: './Header',
    });
  }

  return (
    <div>
      <h1>App</h1>
      <button onClick={setFoo}>Load Foo</button>
      <hr />
      <System system={system} />
    </div>
  );
};
