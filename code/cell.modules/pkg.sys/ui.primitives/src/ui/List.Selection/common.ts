import { t } from '../List/common';

export * from '../List/common';

export const DEFAULTS = {
  get selection(): t.ListSelection {
    return { indexes: [] };
  },
  get mouse(): t.ListMouseState {
    return { over: -1, down: -1 };
  },
  get state(): t.ListSeletionState {
    const { selection, mouse } = DEFAULTS;
    return { selection, mouse };
  },
};
