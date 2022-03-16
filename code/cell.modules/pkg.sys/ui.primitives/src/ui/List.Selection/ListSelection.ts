import { ListSelectionMonitor as Monitor } from './ListSelection.Monitor';
import { useListSelection } from './ListSelection.useSelection';
import { ListSelectionFlags as is } from './ListSelection.Flags';

export { useListSelection };

export const ListSelection = {
  is,
  Monitor,
  useSelection: useListSelection,
};
