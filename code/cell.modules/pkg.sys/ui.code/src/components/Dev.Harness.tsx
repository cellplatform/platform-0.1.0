import React from 'react';
import { Harness } from 'sys.ui.dev';

import CodeEditor from './CodeEditor/DEV';
import Monaco from './Monaco/DEV';

export const ACTIONS = [CodeEditor, Monaco];
export const DevHarness: React.FC = () => <Harness actions={ACTIONS} />;
