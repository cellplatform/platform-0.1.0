import '@platform/css/reset.css';

import React from 'react';
import { createRoot } from 'react-dom/client';

const Imports = {
  DevHarness: () => import('../../Dev.Harness'),
};

/**
 * [Render]
 */
(async () => {
  const root = createRoot(document.getElementById('root') as as HTMLElement); 
  const DevHarness = (await Imports.DevHarness()).DevHarness;
  root.render(<DevHarness />);
})();
