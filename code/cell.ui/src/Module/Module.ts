import { TreeState } from '@platform/state';
import { TreeQuery } from '@platform/state/lib/TreeQuery';

import { create } from './Module.create';
import * as events from './Module.events';
import { fire, register } from './Module.fire';
import { Context } from './Context';
import { provider } from './Context';
import { t } from '../common';

type P = t.IModuleProps;

export class Module {
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
  public static Context = Context;
  public static provider = provider;

  /**
   * Tools for working querying a tree.
   */
  public static Query = TreeQuery;

  /**
   * Helpers for working with tree ids.
   */
  public static identity = TreeState.identity;

  /**
   * Create a new module.
   */
  public static create = create;

  /**
   * Registers a new module as a child of another module.
   */
  public static register = register;

  /**
   * Construct an event helper.
   */
  public static events = events.create;
  public static filter = events.filterEvent;
  public static isModuleEvent = events.isModuleEvent;
  public static fire = fire;
}
