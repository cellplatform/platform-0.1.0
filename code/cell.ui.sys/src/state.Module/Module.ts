import { TreeState } from '@platform/state';

import { create } from './Module.create';
import * as events from './Module.events';
import { fire } from './Module.fire';
import { publish } from './Module.pub';
import { register } from './Module.register';
import { subscribe } from './Module.sub';

export class Module {
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
   * Broadcasts events from the module (and all child modules)
   * throw the given pipe (fire).
   */
  public static publish = publish;
  public static subscribe = subscribe;

  /**
   * Construct an event helper.
   */
  public static events = events.create;
  public static filter = events.filterEvent;
  public static isModuleEvent = events.isModuleEvent;
  public static fire = fire;
}
