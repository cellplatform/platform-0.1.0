import '../node_modules/@platform/css/reset.css';

import * as React from 'react';
import renderer from '@platform/electron/lib/renderer';
import { App } from '../src/App';

renderer.render(<App />, 'root').then(context => context.log.info('renderer loaded!'));
