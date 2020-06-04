import * as React from 'react';

import { Schema } from '@platform/cell.schema';
Schema.uri.ALLOW.NS = ['foo*'];

import { render } from '@platform/ui.dev';
import { Test } from './components/Test';

render(<Test />);
