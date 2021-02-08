import { t } from '../../common';

export type ActionsSelectOnChangeEvent = {
  selected: t.DevActions;
  actions: t.DevActions[];
};
export type ActionsSelectOnChangeEventHandler = (e: ActionsSelectOnChangeEvent) => void;
