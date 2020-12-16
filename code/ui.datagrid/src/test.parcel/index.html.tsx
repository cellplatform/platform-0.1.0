import '../../import.css';
import '../../../../node_modules/@platform/ui.codemirror/import.css';
import * as React from 'react';

import { reset } from '@platform/css';
reset();

import { Schema } from '@platform/cell.schema';
Schema.Uri.ALLOW.NS = ['foo*'];

import { render } from '@platform/ui.dev';
import { Test } from './components/Test';

render(<Test />);
