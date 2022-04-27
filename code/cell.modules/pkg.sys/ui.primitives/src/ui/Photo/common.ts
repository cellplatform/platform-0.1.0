import * as t from './types';

export * from '../common';
export { Radios } from '../OptionButtons';

/**
 * Constants
 */

const config: t.PhotoDefaults = {
  showUrl: false,
  transition: 500,
  duration: 3000,
};

export const DEFAULT = {
  index: 0,
  config,
};
