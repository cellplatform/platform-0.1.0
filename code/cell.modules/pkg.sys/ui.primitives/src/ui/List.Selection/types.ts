type Id = string;
type Index = number;

export type ListSelection = { indexes: Index[] };

export type ListSelectionHook = {
  bus: Id;
  instance: Id;
  current: ListSelection;
};
