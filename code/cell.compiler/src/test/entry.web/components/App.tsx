import React, { useState } from 'react';

import { WebRuntime } from '@platform/cell.runtime.web';
import Award from './assets/award.svg';

type Css = React.CSSProperties;

export type IAppState = { url?: string };

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

  return (
    <div style={styles.base}>
      <h1>App</h1>
      <Award width={60} style={styles.award} />
      <img src={bundle.path('/static/images/wax.png')} style={styles.seal} />
    </div>
  );
};

export default App;
