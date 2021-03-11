import React from 'react';
import { Harness } from 'sys.ui.dev';

import useDragTarget from './hooks/useDragTarget/DEV';
import DotTabstrip from './components/DotTabstrip/DEV';
import Zoom from './components/Zoom/DEV';
import Card from './components/Card/DEV';

export const ACTIONS = [useDragTarget, DotTabstrip, Zoom, Card];
export const DevHarness: React.FC = () => <Harness actions={ACTIONS} />;
