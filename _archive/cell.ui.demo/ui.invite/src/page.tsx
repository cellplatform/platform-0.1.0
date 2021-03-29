import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Index } from './components';
import { LoadSplash } from './components/LoadSplash';
import { VIEWS, loadModule } from './views';
import { Invite } from './components/Invite';
import './styles/global';

/**
 * Render root React element.
 */
// const el = <Index views={VIEWS} />;
const el = <Invite />;
// const el = <LoadSplash />;
// const el = <div />;
ReactDOM.render(el, document.getElementById('root'));

// TEMP 🐷
// loadModule(VIEWS[0]);
