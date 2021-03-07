import React from 'react';

import { Harness } from '../components/Harness';

import sample1 from './sample-1/Component.DEV';
import sample2 from './sample-2/Component.DEV';
import Harnesss from '../components/Harness/Harness.DEV';

export const ACTIONS = [sample1, sample2, Harnesss];
export const DevHarness: React.FC = () => <Harness actions={ACTIONS} />;
