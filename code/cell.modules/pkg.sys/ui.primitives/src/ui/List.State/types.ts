import { Observable } from 'rxjs';
import * as t from '../../types';

type Index = number;

/**
 * List
 */
export type ListState = {
  mouse?: t.ListMouse;
  selection?: ListSelectionState;
};

export type ListStateLazy = {
  get: () => t.ListState;
  changed$: Observable<ListStateChange>;
  selection?: t.ListSelectionConfig;
};

export type ListStateChange = ListStateChangeMouse | ListStateChangeSelection;
export type ListStateChangeMouse = { kind: 'Mouse'; change: ListMouseChange };
export type ListStateChangeSelection = { kind: 'Selection'; change: ListSelectionState };

export type ListStateCtx = { orientation?: t.ListOrientation; total: number };

/**
 * Mouse
 */
export type ListMouseChange = { index: Index; state: ListMouse };
export type ListMouse = { over: Index; down: Index };

/**
 * Selection
 */
export type ListSelectionState = { indexes: ListSelection; isFocused: boolean };
export type ListSelection = Index[];
export type ListSelectionConfig = {
  multi?: boolean; // Allow selection of multiple items.
  allowEmpty?: boolean;
  clearOnBlur?: boolean;
  keyboard?: boolean; // Support keyboard interaction (default: true).
};
