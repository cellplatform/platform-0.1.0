import { TreeState } from '@platform/state';
import { TreeQuery } from '@platform/state/lib/TreeQuery';

import { create } from './Module.create';
import * as events from './Module.events';
import { fire, register } from './Module.fire';
import { t } from '../common';

export const Module: t.Module = {
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
