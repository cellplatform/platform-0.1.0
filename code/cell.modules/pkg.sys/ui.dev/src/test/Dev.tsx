import React from 'react';

import { Harness } from '../components/Harness';
import { ACTIONS } from './Dev.ACTIONS';

export const DevHarness: React.FC = () => <Harness actions={ACTIONS} />;
