import React from 'react';
import { Harness } from 'sys.ui.dev';

import Sample from './Sample/DEV';
export const ACTIONS = [Sample];

export const Dev: React.FC = () => <Harness actions={ACTIONS} />;
