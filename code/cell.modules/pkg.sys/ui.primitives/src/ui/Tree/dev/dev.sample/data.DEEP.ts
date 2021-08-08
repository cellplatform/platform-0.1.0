import { t } from '../common';
import { assignLabelDeep } from './util';

const header: t.ITreeviewNodeHeader = { isVisible: false, marginBottom: 45 };

export const DEEP: t.ITreeviewNode = {
  id: 'root',
  props: { treeview: { label: 'Root', header } },
  children: [
    {
      id: 'Default-1',
      children: [
        { id: 'Child-1.1' },
        {
          id: 'Child-1.2',
          props: { treeview: { inline: {} } },
          children: [
            {
              id: 'Child-1.2.1',
              props: { treeview: { inline: {} } },
              children: [{ id: 'Child-1.2.1.1' }, { id: 'Child-1.2.1.2' }, { id: 'Child-1.2.1.3' }],
            },
            { id: 'Child-1.2.2' },
            { id: 'Child-1.2.3' },
          ],
        },
        { id: 'Child-1.3' },
      ],
    },
    {
      id: 'Default-2',
      props: { treeview: { inline: {} } },
      children: [
        { id: 'Child-2.1' },
        {
          id: 'Child-2.2',
          props: { treeview: { inline: {} } },
          children: [
            {
              id: 'Child-2.2.1',
              props: { treeview: { inline: {} } },
              children: [{ id: 'Child-2.2.1.1' }],
            },
            { id: 'Child-2.2.2' },
          ],
        },
        {
          id: 'Child-2.3',
          props: { treeview: { inline: {} } },
          children: [{ id: 'Child-2.3.1' }],
        },
      ],
    },
    { id: 'Default-3' },
  ],
};

assignLabelDeep(DEEP);
