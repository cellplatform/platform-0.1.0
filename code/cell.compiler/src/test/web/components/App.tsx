import React, { useState } from 'react';
import { ISystem, System } from './System';

type Css = React.CSSProperties;

export type IAppState = { url?: string };

/**
 * Test Application
 * See:
 *    https://github.com/module-federation/module-federation-examples/tree/master/dynamic-system-host
 *    https://webpack.js.org/concepts/module-federation/#dynamic-remote-containers
 */
export const App = () => {
  const [system, setSystem] = useState<ISystem>();
  const [state, setState] = useState<IAppState>();

  const setter = (port: number, scope: string, module: string) => {
    return () => {
      const url = `http://localhost:${port}/remoteEntry.js`;
      setSystem({ url, scope, module });
      setState({ url });
    };
  };

  const setFoo = () => {
    const url =
      'http://localhost:5000/cell:ckglm3anc000c8iet9e7nfgoo:A1/file/sample/web/remoteEntry.js';

    const scope = 'sys.ui.editor.code';
    const module = './Dev';
    setSystem({ url, scope, module });
    setState({ url });
  };

  const styles: Record<string, Css> = {
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
    buttons: {
      marginBottom: 12,
    },
    body: {
      position: 'absolute',
      top: 180,
      right: 50,
      bottom: 50,
      left: 50,
    },
    seal: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 125,
    },
  };

  return (
    <div style={styles.base}>
      <h1>App</h1>
      <img src={'/static/images/wax.png'} style={styles.seal} />

      <div style={styles.buttons}>
        <button onClick={setter(3001, 'sample.foo', './Header')}>sample.foo</button>
        <button onClick={setter(3003, 'sys.ui.editor.code', './Dev')}>code</button>
        <button onClick={setFoo}>code (from cell)</button>
      </div>
      <div>{state?.url || '-'}</div>
      <hr style={styles.hr} />
      <div style={styles.body}>
        <System system={system} />
      </div>
    </div>
  );
};
