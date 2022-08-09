import '@platform/css/reset.css';

import React from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './components/App';
import './workers.init';

const root = createRoot(document.getElementById('root') as as HTMLElement); 
root.render(<App />);
