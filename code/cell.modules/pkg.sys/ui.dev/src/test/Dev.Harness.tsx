import React from 'react';

import { Harness } from '../components/Harness';

import sample1 from './sample-1/DEV';
import sample2 from './sample-2/DEV';
import sample3 from './sample-3/DEV';
import Harnesss from '../components/Harness/DEV';

export const ACTIONS = [sample1, sample2, sample3, Harnesss];
export const DevHarness: React.FC = () => <Harness actions={ACTIONS} />;
