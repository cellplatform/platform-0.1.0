import * as t from './types';

export const MinSizeHideStrategies: t.MinSizeHideStrategy[] = [
  'css:opacity',
  'css:display',
  'unmount',
];
export const MinSizeDefaults = {
  hideStrategy: MinSizeHideStrategies[0],
};
