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

// Setup observables.
// const events$ = this.events$.pipe(takeUntil(this.unmounted$));
// const tree = TreeView.events(events$);

// tree.mouse().click.node$.subscribe(async e => {
//   // TEMP 🐷
//   log.group('Tree Click');
//   log.info(e);
//   log.info('context', this.context);
//   log.groupEnd();
// });
