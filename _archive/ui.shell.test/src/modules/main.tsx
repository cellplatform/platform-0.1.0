import * as React from 'react';

import { filter } from 'rxjs/operators';
import { t, time, css, color } from '../common';
import { Icons } from '../Icons';

const TREE: t.ITreeNode = {
  id: 'ROOT',
  props: { label: 'ui.shell' },
  children: [
    { id: 'doc', props: { icon: 'Book' } },
    { id: 'sheet' },
    { id: 'progress:start' },
    { id: 'progress:stop' },
    { id: 'sidebar' },
    { id: 'toggle:tree' },
    { id: 'toggle:sidebar' },
    { id: 'toggle:header' },
    { id: 'toggle:footer' },
    { id: 'customBody', props: { body: 'FOO' } },
    { id: 'footer:border:0' },
  ],
};

export const init: t.ShellImportInit = async args => {
  const { shell } = args;
  const tree = shell.state.tree;

  tree.render = {
    icon: e => Icons[e.icon],
    node: e => {
      const styles = {
        base: css({
          color: color.format(1),
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
          border: `dashed 1px ${color.format(0.3)}`,
          borderRadius: 3,
          flex: 1,
          Flex: 'center-center',
          fontSize: 12,
          padding: 3,
        }),
      };
      return (
        <div {...styles.base}>
          <div>{e.body}</div>
        </div>
      );
    },
  };
  tree.root = TREE;

  shell.load('Footer');

  const click = shell.events.tree.mouse({ button: ['LEFT'] }).click;
  const onClick = (id: string, fn: () => void) =>
    click.node$.pipe(filter(e => e.id === id)).subscribe(e => fn());

  onClick('doc', () => shell.load('Doc', { progress: 1500, simulateLatency: 1000 }));
  onClick('sheet', () => {
    shell.load('Sheet', { progress: 2500, simulateLatency: 2000 });
  });

  onClick('progress:start', () => shell.progress.start({ duration: 3000 }));
  onClick('progress:stop', () => shell.progress.complete());

  onClick('sidebar', () => shell.load('Sidebar'));

  onClick('toggle:tree', () => {
    shell.state.tree.width = shell.state.tree.width ? 0 : 300;
  });

  onClick('toggle:sidebar', () => {
    shell.state.sidebar.width = shell.state.sidebar.width ? 0 : 300;
  });

  onClick('toggle:header', () => {
    shell.state.header.height = toSize(shell.state.header.height) ? 0 : 38;
  });

  onClick('toggle:footer', () => {
    shell.state.footer.height = toSize(shell.state.footer.height) ? 0 : 28;
  });

  onClick('footer:border:0', () => {
    shell.state.footer.border = 0;
  });
};

/**
 * [Helpers]
 */

function toSize(input: t.IShellSize | number) {
  return typeof input === 'object' ? input.value : input;
}
