/* eslint-disable react/display-name */

import * as React from 'react';

type O = Record<string, unknown>;

/**
 * The React [Context] used to pass down common modules to components.
 *
 * To use add a static `contextType` to the consuming component,
 * eg:
 *
 *      export class MyView extends React.PureComponent {
 *        public static contextType = Module.Context;
 *        public context!: t.MyContext
 *      }
 *
 * See:
 *    https://reactjs.org/docs/context.html
 */
export const Context = React.createContext({} as any);
Context.displayName = '@platform/ui/Module';

export type ReactContext = React.ContextType<typeof Context>;

/**
 * Factory for creating a <Provider> component to pass a
 * store (and optionally additional props) through the react
 * hierarchy to child components.
 */
export function provider<P extends O>(context: P): React.FunctionComponent {
  return (props: { children?: React.ReactNode } = {}) => (
    <Context.Provider value={context}>{props.children}</Context.Provider>
  );
}
