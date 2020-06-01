import { value, time } from '@platform/util.value';
export { value, time };

export { expect, expectError } from '@platform/test';
export * from '../common';
export { fs } from '@platform/fs';

export const randomPort = () => {
  const random = (min = 0, max = 9) => value.random(min, max);
  return value.toNumber(`${random(6, 9)}${random()}${random()}${random()}`);
};
