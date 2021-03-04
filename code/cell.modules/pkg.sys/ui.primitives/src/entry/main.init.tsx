import '@platform/css/reset.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { DevHarness } from '../components/DevHarness';
import { WebRuntime, log } from '../common';

log.group('WebRuntime');
log.info('module', WebRuntime.module);
log.info('bundle', WebRuntime.bundle);
log.groupEnd();

const el = <DevHarness />;
const root = <React.StrictMode>{el}</React.StrictMode>;

ReactDOM.render(root, document.getElementById('root'));
