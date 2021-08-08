import { t } from '../common';
import { assignLabelDeep } from './util';

const header: t.ITreeviewNodeHeader = { isVisible: false, marginBottom: 45 };

export const TWISTY: t.ITreeviewNode = {
  id: 'root',
  props: { treeview: { label: 'Root', header } },
  children: [
    { id: 'Default-1' },
    {
      id: 'Default-2',
      props: { treeview: { inline: {} } },
      children: [{ id: 'Child-2.1' }, { id: 'Child-2.2' }, { id: 'Child-2.3' }],
    },
    { id: 'Default-3' },
    { id: 'Default-4' },
  ],
};

assignLabelDeep(TWISTY);
