import React from 'react';
import { Harness } from 'sys.ui.dev';

import CodeEditor from './CodeEditor/CodeEditor.DEV';

export const ACTIONS = [CodeEditor];
export const DevHarness: React.FC = () => <Harness actions={ACTIONS} />;
