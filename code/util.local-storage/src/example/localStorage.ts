import { localStorage as init } from '..';

const prefix = '@TDB/slc/';

type IStorage = {
  text: string;
  debug: boolean;
};

export const localStorage = init<IStorage>(
  { text: { default: '' }, debug: { default: false } },
  { prefix },
);
