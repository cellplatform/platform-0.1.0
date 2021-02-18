import React from 'react';
import { Harness } from 'sys.ui.dev';

import Sample from './Sample/Sample.DEV';
import Spreadsheet from './Spreadsheet/Spreadsheet.DEV';

export const ACTIONS = [Spreadsheet, Sample];

export const Dev: React.FC = () => <Harness actions={ACTIONS} />;
