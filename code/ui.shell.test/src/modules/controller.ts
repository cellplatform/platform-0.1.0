import { filter } from 'rxjs/operators';
import { t, time } from '../common';

const ROOT: t.ITreeNode = {
  id: 'ROOT',
  props: { label: 'ui.shell' },
  children: [{ id: 'doc' }, { id: 'sheet' }, { id: 'progress:start' }, { id: 'progress:stop' }],
};

export const init: t.ShellImportInit = async args => {
  const { shell } = args;
  shell.state.tree.root = ROOT;

  const click = shell.events.tree.mouse({ button: ['LEFT'] }).click;
  const onClick = (id: string, fn: () => void) =>
    click.node$.pipe(filter(e => e.id === id)).subscribe(e => fn());

  onClick('doc', () => shell.load('A'));
  onClick('sheet', () => shell.load('C'));

  onClick('progress:start', () => shell.progress.start({ duration: 3000 }));
  onClick('progress:stop', () => shell.progress.complete());
};
