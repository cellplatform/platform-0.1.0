import React from 'react';
import { Harness } from 'sys.ui.dev';

import useDragTarget from '../hooks/useDragTarget/DEV';
import DotTabstrip from './DotTabstrip/DEV';
import Zoom from './Zoom/DEV';

export const ACTIONS = [useDragTarget, DotTabstrip, Zoom];
export const DevHarness: React.FC = () => <Harness actions={ACTIONS} />;
