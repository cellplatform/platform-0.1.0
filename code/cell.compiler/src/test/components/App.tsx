import React from 'react';
import { ISystem, System } from './System';

/**
 * Test Application
 * See:
 *    https://github.com/module-federation/module-federation-examples/tree/master/dynamic-system-host
 */
export const App = () => {
  const [system, setSystem] = React.useState<ISystem>();

  const setter = (port: number, scope: string, module: string) => {
    return () => {
      setSystem({
        url: `http://localhost:${port}/remoteEntry.js`,
        scope,
        module,
      });
    };
  };

  return (
    <div>
      <h1>App</h1>
      <button onClick={setter(3001, 'foo', './Header')}>Load Foo</button>
      <button onClick={setter(3005, 'SysUiCore', './button/Button')}>Load Core</button>
      <hr />
      <System system={system} />
    </div>
  );
};
