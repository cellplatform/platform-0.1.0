import * as React from 'react';

import { renderer } from '@platform/electron/lib/renderer';
import { Test } from './components/Test';

renderer.render(<Test />, 'root');
