import { RuntimeModule } from '../types';

export const Runtime = {
  /**
   * Extract module information from __CELL__.
   */
  module(input?: RuntimeModule) {
    input = toEnv(input);
    const module: RuntimeModule['module'] = input?.module || { name: '', version: '' };
    return module;
  },
};

/**
 * Helpers
 */

const toEnv = (input?: RuntimeModule) => {
  return !input && typeof __CELL__ !== 'undefined' ? __CELL__ : input;
};
