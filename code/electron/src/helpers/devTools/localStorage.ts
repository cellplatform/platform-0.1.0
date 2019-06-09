import { localStorage as init } from '@platform/util.local-storage';

const prefix = '@platform/DEV_TOOLS/';

type IStorage = {
  text: string;
  debug: boolean;
};

export const localStorage = init<IStorage>(
  { text: { default: '' }, debug: { default: false } },
  { prefix },
);
