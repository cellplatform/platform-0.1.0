import * as React from 'react';
import { Observable } from 'rxjs';

import * as t from '../types';

/**
 * The React [Context] used to pass down common modules to components.
 *
 * To use add a static `contextType` to the consuming component,
 * eg:
 *
 *      import { loader } from '@platform/ui.loader'
 *
 *      export class MyView extends React.PureComponent {
 *        public static contextType = loader.Context;
 *        public context!: loader.ReactContext
 *      }
 *
 * See:
 *    https://reactjs.org/docs/context.html
 */
export const Context = React.createContext<t.ILoaderContext>({} as any);
Context.displayName = '@platform/loader/Context';

/**
 * Used to strongly type the [context] on a React component.
 * eg:
 *
 *      import { loader } from '@platform/ui.loader'
 *
 *      export class MyView extends React.PureComponent {
 *        public static contextType = loader.Context;
 *        public context!: loader.ReactContext
 *      }
 *
 */
export type ReactContext = React.ContextType<typeof Context>;

/**
 * Factory for creating a <Provider> component to pass a
 * store (and optionally additional props) through the react
 * hierarchy to child components.
 */
export function createProvider<P = {}>(args: {
  ctx: t.ILoaderContext;
  props?: P;
}): React.FunctionComponent {
  const context: t.ILoaderContext = {
    ...args.ctx,
    ...(args.props || {}), // Optional props to extend the context with.
  };
  return (props: { children?: React.ReactNode } = {}) => (
    <Context.Provider value={context}>{props.children}</Context.Provider>
  );
}
