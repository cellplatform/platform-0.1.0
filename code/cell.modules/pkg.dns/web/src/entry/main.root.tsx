import '@platform/css/reset.css';

import React from 'react';
import ReactDOM from 'react-dom';

import { rx } from '../common';
import { Root } from '../web.ui/Root';

const bus = rx.bus();
const el = <Root bus={bus} />;
ReactDOM.render(el, document.getElementById('root'));
