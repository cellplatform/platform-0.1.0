import { t } from '../common';

export const ActionsSelect = {
  /**
   * Read/Write function for storing the current selected
   * state of an <ActionsSelect> dropdown using the
   * browser's LocalStorage.
   *
   * Pass [undefined] to read.
   */
  localStorage(args: { key: string; actions: t.DevActions[] }): t.ActionsSelectStore {
    const { key, actions } = args;

    const fn: t.ActionsSelectStore = async (value) => {
      if (value !== undefined) localStorage.setItem(key, value.toObject().namespace);
      return actions.find((actions) => actions.toObject().namespace === localStorage.getItem(key));
    };

    return fn;
  },
};
