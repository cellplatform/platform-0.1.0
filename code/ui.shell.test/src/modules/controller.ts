import { shell, t } from '../common';

// TEMP 🐷
const ROOT: t.ITreeNode = {
  id: 'ROOT',
  props: { label: 'ui.shell' },
  children: [{ id: 'one' }, { id: 'two' }],
};

export const init: t.ShellImportInit = async args => {
  const { shell } = args;
  shell.state.tree.root = ROOT;

  shell.events$.subscribe(e => {
    console.log('e', e);
  });

  // shell.ev
};
