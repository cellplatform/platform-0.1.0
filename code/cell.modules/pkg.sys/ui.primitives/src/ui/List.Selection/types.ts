import * as t from '../../types';

type Id = string;
type Index = number;

export type ListSelection = { indexes: Index[] };

export type ListSeletionState = {
  selection: ListSelection;
  mouse: t.ListMouseState;
};

export type ListSelectionHook = {
  bus: Id;
  instance: Id;
  current: ListSeletionState;
};
