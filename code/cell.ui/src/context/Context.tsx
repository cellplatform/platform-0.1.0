import * as React from 'react';
import * as t from '../common/types';

/**
 * The React [Context] used to pass down common modules to components.
 *
 * To use add a static `contextType` to the consuming component,
 * eg:
 *
 *      import { cell } from '@platform/cell.ui'
 *
 *      export class MyView extends React.PureComponent {
 *        public static contextType = cell.Context;
 *        public context!: cell.ICellContext
 *      }
 *
 * See:
 *    https://reactjs.org/docs/context.html
 */
export const Context = React.createContext<t.ICellContext>({} as any);
Context.displayName = '@platform/cell/Context';

/**
 * Used to strongly type the [context] on a React component.
 * eg:
 *
 *      import { cell } from '@platform/cell.ui'
 *
 *      export class MyView extends React.PureComponent {
 *        public static contextType = cell.Context;
 *        public context!: cell.ICellContext
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
  ctx: t.ICellContext;
  props?: P;
}): React.FunctionComponent {
  const context: t.ICellContext = {
    ...args.ctx,
    ...(args.props || {}), // Optional props to extend the context with.
  };
  return (props: { children?: React.ReactNode } = {}) => (
    <Context.Provider value={context}>{props.children}</Context.Provider>
  );
}
