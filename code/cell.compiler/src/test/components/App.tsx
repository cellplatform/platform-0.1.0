import React from 'react';
import { ISystem, System } from './System';

/**
 * Test Application
 * See:
 *    https://github.com/module-federation/module-federation-examples/tree/master/dynamic-system-host
 *    https://webpack.js.org/concepts/module-federation/#dynamic-remote-containers
 */
export const App = () => {
  const [system, setSystem] = React.useState<ISystem>();

  const setter = (port: number, scope: string, module: string) => {
    return () => {
      const url = `http://localhost:${port}/remoteEntry.js`;
      setSystem({ url, scope, module });
    };
  };

  return (
    <div>
      <h1>App</h1>
      <button onClick={setter(3001, 'foo', './Header')}>foo</button>
      <button onClick={setter(3001, 'sample.foo', './Header')}>sample.foo</button>
      <button onClick={setter(3003, 'sys.ui.editor.code', './Dev')}>code</button>
      <hr />
      <System system={system} />
    </div>
  );
};
