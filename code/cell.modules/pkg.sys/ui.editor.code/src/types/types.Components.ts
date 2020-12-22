import { t } from './common';

/**
 * <CodeEditor>
 */
export type CodeEditorReadyEvent = { id: string; editor: t.CodeEditorInstance };
export type CodeEditorReadyEventHandler = (e: CodeEditorReadyEvent) => void;
