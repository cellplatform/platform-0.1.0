import React from 'react';
import { Harness } from 'sys.ui.dev';

import DragTarget from './DragTarget/DragTarget.DEV';

export const ACTIONS = [DragTarget];
export const Dev: React.FC = () => <Harness actions={ACTIONS} />;
