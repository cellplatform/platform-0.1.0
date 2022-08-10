import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import * as cuid from '@platform/util.value/src/id/cuid';
console.log('cuid:', cuid.generate());

const el = <App />;
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<React.StrictMode>{el}</React.StrictMode>);
