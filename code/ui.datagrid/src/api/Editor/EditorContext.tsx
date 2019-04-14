import * as React from 'react';
import { t } from '../../common';

/**
 * The React [Context] used to pass down common properties to editor components.
 * To use add a static `contextType` to the consuming component, eg:
 *
 *      import datagrid from '@platform/ui.datagrid';
 *
 *      export class MyEditor extends React.PureComponent {
 *        public static contextType = datagrid.EditorContext;
 *        public context!: datagrid.ReactEditorContext
 *      }
 *
 * See:
 *    https://reactjs.org/docs/context.html
 *
 */
export const EditorContext = React.createContext<t.IEditorContext>({} as any);
EditorContext.displayName = '@platform/ui.datagrid/Context';

/**
 * Used to strongly type the [context] on a React component.
 * eg:
 *
 *      import datagrid from '@platform/ui.datagrid';
 *
 *      export class MyEditor extends React.PureComponent {
 *        public static contextType = datagrid.EditorContext;
 *        public context!: datagrid.ReactEditorContext
 *      }
 *
 */
export type ReactEditorContext = React.ContextType<typeof EditorContext>;

/**
 * Factory for creating a <Provider> component pre-baked
 * with the context that will be used by the popup-editor.
 */
export function createProvider(context: t.IEditorContext): React.FunctionComponent {
  return (props: { children?: React.ReactNode } = {}) => (
    <EditorContext.Provider value={context}>{props.children}</EditorContext.Provider>
  );
}
