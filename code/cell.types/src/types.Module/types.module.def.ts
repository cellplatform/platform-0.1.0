import { t } from '../common';

/**
 * The definition entry-point for a module.
 * This is what is explored by module authors.
 */
export type IModuleDef = {
  init(bus: t.EventBus, parent?: string): t.IModule;
};
