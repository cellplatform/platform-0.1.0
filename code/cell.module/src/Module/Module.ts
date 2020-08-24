import { TreeState } from '@platform/state';
import { TreeQuery } from '@platform/state/lib/TreeQuery';

import { create } from './Module.create';
import * as events from './Module.events';
import { fire, register } from './Module.fire';
import { Context } from './Context';
import { provider } from './Context';
import { t } from '../common';

export const Module: t.Module = {
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
  Context,
  provider,

  /**
   * Tools for working querying a tree.
   */
  Query: TreeQuery,

  /**
   * Helpers for working with tree ids.
   */
  Identity: TreeState.identity,

  /**
   * Create a new module.
   */
  create,

  /**
   * Registers a new module as a child of another module.
   */
  register,

  /**
   * Construct an event helper.
   */
  fire,
  events: events.create,
  isModuleEvent: events.isModuleEvent,
  filter: events.eventFilter,
};
