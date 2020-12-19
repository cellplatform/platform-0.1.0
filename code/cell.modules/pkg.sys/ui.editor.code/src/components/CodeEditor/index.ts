import { t } from '../../common';
import * as React from 'react';
import { CodeEditorEvents } from '../../event';

import { CodeEditor as Component, CodeEditorProps } from './CodeEditor';

/**
 * Decorate component with helper functions.
 */
type FC = React.FC<CodeEditorProps> & { events: t.CodeEditorEventsFactory };
export const CodeEditor = Component as FC;
CodeEditor.events = CodeEditorEvents;
