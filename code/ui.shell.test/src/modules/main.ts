import { filter } from 'rxjs/operators';
import { t, time } from '../common';

const TREE: t.ITreeNode = {
  id: 'ROOT',
  props: { label: 'ui.shell' },
  children: [
    { id: 'doc' },
    { id: 'sheet' },
    { id: 'progress:start' },
    { id: 'progress:stop' },
    { id: 'sidebar' },
    { id: 'toggle:tree' },
    { id: 'toggle:sidebar' },
  ],
};

export const init: t.ShellImportInit = async args => {
  const { shell } = args;
  shell.state.tree.root = TREE;

  console.log('INIT shell', shell);

  // const click = shell.events.tree.mouse({ button: ['LEFT'] }).click;
  // const onClick = (id: string, fn: () => void) =>
  //   click.node$.pipe(filter(e => e.id === id)).subscribe(e => fn());

  // onClick('doc', () => shell.load('doc', { progress: 1500, simulateLatency: 1000 }));
  // onClick('sheet', () => {
  //   shell.load('sheet', { progress: 2500, simulateLatency: 2000 });
  // });

  // onClick('progress:start', () => shell.progress.start({ duration: 3000 }));
  // onClick('progress:stop', () => shell.progress.complete());

  // onClick('sidebar', () => shell.load('sidebar'));

  // onClick('toggle:tree', () => {
  //   shell.state.tree.width = shell.state.tree.width ? 0 : 300;
  // });

  // onClick('toggle:sidebar', () => {
  //   shell.state.sidebar.width = shell.state.sidebar.width ? 0 : 300;
  // });
};
