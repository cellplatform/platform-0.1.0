import { localStorage as init } from '@platform/util.local-storage';

const prefix = '@PLATFORM/cli/';

type IStorage = {
  text: string;
};

export const localStorage = init<IStorage>({ text: { default: '' } }, { prefix });
