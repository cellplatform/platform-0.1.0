import * as React from 'react';
import { t } from '../../common';

/**
 * Factory for creating a <Provider> component pre-baked
 * with the context that will be used by the popup-editor.
 */
export function createProvider(context: t.IEditorContext): React.FunctionComponent {
  return (props: { children?: React.ReactNode } = {}) => (
    <t.EditorContext.Provider value={context}>{props.children}</t.EditorContext.Provider>
  );
}
