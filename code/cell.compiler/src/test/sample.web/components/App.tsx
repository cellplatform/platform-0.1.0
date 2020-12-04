import React, { useState } from 'react';

import { WebRuntime } from '@platform/cell.runtime.web';
import Award from './assets/award.svg';
import { System } from './System';

type Css = React.CSSProperties;

export type IAppState = { url?: string };

export type ISystem = {
  url: string;
  namespace: string;
  entry: string;
};

const bundle = WebRuntime.bundle;

console.log('module', WebRuntime.module);
console.log('bundle', WebRuntime.bundle);
console.log("bundle.path('/static/images/wax.png')", bundle.path('/static/images/wax.png'));

/**
 * Test Application
 *
 * See:
 *    https://github.com/module-federation/module-federation-examples/tree/master/dynamic-system-host
 *    https://webpack.js.org/concepts/module-federation/#dynamic-remote-containers
 *
 */
export const App = () => {
  const [system, setSystem] = useState<ISystem>();
  const [state, setState] = useState<IAppState>();

  const setter = (port: number, namespace: string, entry: string) => {
    return () => {
      const url = `http://localhost:${port}/remoteEntry.js`;
      setSystem({ url, namespace, entry });
      setState({ url });
    };
  };

  const setFoo = () => {
    const url =
      'http://localhost:5000/cell:ckgu68hjj000ciwet59do0wb4:A1/file/sample/remoteEntry.js';
    const namespace = 'foo';
    const entry = './Dev';
    setSystem({ url, namespace, entry });
    setState({ url });
  };

  const setAi = () => {
    const url =
      'http://localhost:5000/cell:ckgu7ryv8000cg0etbjfwet91:A1/file/sample/remoteEntry.js';
    const namespace = 'ai';
    const entry = './Dev';
    setSystem({ url, namespace, entry });
    setState({ url });
  };

  const setCodeEditor = () => {
    const url = 'https://dev.db.team/cell:ckgse6r8l000ccwethl0ubdrh:A1/file/sample/remoteEntry.js';
    const namespace = 'sys.ui.editor.code';
    const entry = './Dev';
    setSystem({ url, namespace, entry });
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
    award: {
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      transform: 'rotate(10deg)',
      marginBottom: 10,
    },
  };

  const elSystem = system && (
    <System url={system.url} namespace={system.namespace} entry={system.entry} />
  );

  return (
    <div style={styles.base}>
      <h1>App</h1>
      <Award width={60} style={styles.award} />
      <img src={bundle.path('/static/images/wax.png')} style={styles.seal} />

      <div style={styles.buttons}>
        <button onClick={setter(3030, 'tmp.trailtribe', './Dev')}>TrailTribe</button>
        <button onClick={setter(3000, 'foo', './Dev')}>foo</button>
        <button onClick={setFoo}>foo(2)</button>
        <button onClick={setter(1234, 'sys.ui.shell', './Dev')}>shell</button>
        <button onClick={setAi}>ai</button>
        <button onClick={setter(3003, 'sys.ui.editor.code', './Dev')}>code (local)</button>
        <button onClick={setCodeEditor}>code (remote)</button>
      </div>
      <div>{state?.url || '-'}</div>
      <hr style={styles.hr} />
      <div style={styles.body}>{elSystem}</div>
    </div>
  );
};
