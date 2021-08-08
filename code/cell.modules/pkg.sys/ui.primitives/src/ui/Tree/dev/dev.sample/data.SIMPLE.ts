import { t } from '../common';
import { assignLabelDeep } from './util';

export const SIMPLE: t.ITreeviewNode = {
  id: 'root',
  props: {
    treeview: {
      label: 'Sheet',
      icon: 'Face',
    },
  },
  children: [
    { id: 'child-1', props: { treeview: { icon: 'Face', marginTop: 30 } } },
    { id: 'child-2', props: { treeview: { icon: 'Face' } } },
    { id: 'child-3', props: { treeview: { icon: 'Face' } } },
    { id: 'child-4', props: { treeview: { icon: 'Face' } } },
    { id: 'child-5', props: { treeview: { icon: 'Face' } } },
  ],
};

assignLabelDeep(SIMPLE);
