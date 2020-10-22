import React from 'react';
import { ISystem, System } from './System';

type Css = React.CSSProperties;

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

  const styles = {
    base: {
      paddingLeft: 50,
      paddingRight: 50,
    },
    hr: {
      border: 'none',
      borderBottom: `solid 3px ${'rgba(0, 0, 0, 0.1)'}`,
      marginTop: 20,
      marginBottom: 20,
    },
    body: {
      position: 'absolute',
      top: 150,
      right: 50,
      bottom: 50,
      left: 50,
    },
  };

  return (
    <div style={styles.base}>
      <h1>App</h1>
      <button onClick={setter(3001, 'sample.foo', './Header')}>sample.foo</button>
      <button onClick={setter(3003, 'sys.ui.editor.code', './Dev')}>code</button>
      <hr style={styles.hr} />
      <div style={styles.body as Css}>
        <System system={system} />
      </div>
    </div>
  );
};
