import { localStorage as init } from '..';

const prefix = '@platform/ns/';

type IStorage = {
  text: string;
  debug: boolean;
};

export const localStorage = init<IStorage>(
  { text: { default: '' }, debug: { default: false } },
  { prefix },
);
