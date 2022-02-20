import '@platform/css/reset.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { DevHarness } from '../Dev.Harness';
import { DevSampleApp } from '../web.ui/dev.Networks/DEV.Sample.App';

const url = new URL(location.href);
const el = url.searchParams.has('dev') ? <DevHarness /> : <DevSampleApp />;
ReactDOM.render(el, document.getElementById('root'));
