import React from 'react';
import { Harness } from 'sys.ui.dev';

import { rx, t } from '../../common';
import CodeEditor from '../../components/CodeEditor/CodeEditor.DEV';
import { DevActions } from './Dev.ACTIONS';

const bus = rx.bus<t.CodeEditorEvent>();
const foo = DevActions(bus);

const ACTIONS = [foo.main, CodeEditor];

export const Dev: React.FC = () => <Harness actions={ACTIONS} />;
