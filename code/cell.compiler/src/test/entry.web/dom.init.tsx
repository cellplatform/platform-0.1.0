import '@platform/css/reset.css';

import React from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './components/App';
import './workers.init';

const root = createRoot(document.getElementById('root')!); // eslint-disable-line
root.render(<App />);
