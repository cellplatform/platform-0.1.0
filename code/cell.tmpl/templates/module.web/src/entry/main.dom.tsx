import '@platform/css/reset.css';

import React from 'react';
import ReactDOM from 'react-dom';

const Imports = {
  DevHarness: () => import('../Dev.Harness'),
};

/**
 * [Render]
 */
(async () => {
  const DevHarness = (await Imports.DevHarness()).DevHarness;
  ReactDOM.render(<DevHarness />, document.getElementById('root'));
})();
