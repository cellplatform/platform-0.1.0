import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// import './index.css';

// import * as rx from '@platform/util.value/src/rx/rx';
// console.log('rx', rx);

import * as cuid from '@platform/util.value/src/id/cuid';
// console.log('generate', generate);

console.log('cuid:', cuid.generate());

// console.log('rx', rx);
// import DevHarness from 'sys.ui.doc/src/Dev.Harness';
import { Observable, Subject } from 'rxjs';

console.log('Subject', Subject);

// import f from 'http://192.168.1.2:3000/my-lib.js';
// console.log('f', f);

// const bus = rx.bus();
// import { part } from 'module';
const el = <App />;
// const el = <DevHarness bus={bus} />;
// const el = <div>hello</div>;
// console.log('bus', bus);

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<React.StrictMode>{el}</React.StrictMode>);
