import React from 'react';
import { Harness } from 'sys.ui.dev';

import CodeEditor from './CodeEditor/CodeEditor.DEV';

export const ACTIONS = [CodeEditor];
export const Dev: React.FC = () => <Harness actions={ACTIONS} />;
