import * as React from 'react';
import * as t from '../types';

/**
 * The React [Context] used to pass down common modules to components.
 * To use add a static `contextType` to the consuming component, eg:
 *
 *      import renderer from '@platform/electron/lib/renderer';
 *
 *      export class MyView extends React.PureComponent {
 *        public static contextType = renderer.Context;
 *        public context!: renderer.ReactContext
 *      }
 *
 * See:
 *    https://reactjs.org/docs/context.html
 */
export const Context = React.createContext<t.IRendererContext>({} as any);
Context.displayName = '@platform/electron/Context';

/**
 * Used to strongly type the [context] on a React component.
 * eg:
 *
 *      import renderer from '@platform/electron/lib/renderer';
 *
 *      export class MyView extends React.PureComponent {
 *        public static contextType = renderer.Context;
 *        public context!: renderer.ReactContext
 *      }
 *
 */
export type ReactContext = React.ContextType<typeof Context>;

/**
 * Factory for creating a <Provider> component pre-baked
 * with the electron context (ipc, log, settings...etc).
 */
export function createProvider(context: t.IRendererContext): React.FunctionComponent {
  return (props: { children?: React.ReactNode } = {}) => (
    <Context.Provider value={context}>{props.children}</Context.Provider>
  );
}
