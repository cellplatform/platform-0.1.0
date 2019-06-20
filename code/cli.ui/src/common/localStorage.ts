import { localStorage, ILocalStorage } from '@platform/util.local-storage';

export type IStorage = ILocalStorage<IStorageProps>;
export type IStorageProps = {
  text: string;
  history: string[];
};

const PREFIX = '@PLATFORM/cli/';

export function init(id?: string): IStorage {
  let prefix = PREFIX;
  prefix = id ? `${prefix}${id}/` : prefix;
  return localStorage<IStorageProps>(
    {
      text: { default: '' },
      history: { default: [] },
    },
    { prefix },
  );
}
