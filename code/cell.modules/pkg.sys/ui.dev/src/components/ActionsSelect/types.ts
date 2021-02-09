import { t } from '../../common';

export type ActionsSelectOnChangeEvent = {
  selected: t.Actions;
  actions: t.Actions[];
};
export type ActionsSelectOnChangeEventHandler = (e: ActionsSelectOnChangeEvent) => void;
