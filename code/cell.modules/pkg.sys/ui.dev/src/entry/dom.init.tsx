import '@platform/css/reset.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { DevHarness } from '../Dev.Harness';

const el = <DevHarness />;
const root = createRoot(document.getElementById('root')!); // eslint-disable-line
root.render(el);
