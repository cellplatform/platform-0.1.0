import { value } from '../common';

export { expect, expectError } from '@platform/test';
export { fs } from '@platform/fs';
export * from '../common';

export const randomPort = () => {
  const random = (min = 0, max = 9) => value.random(min, max);
  return value.toNumber(`${random(6, 9)}${random()}${random()}${random()}`);
};
