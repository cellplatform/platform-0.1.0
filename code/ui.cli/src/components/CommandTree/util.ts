import { t } from '../../common';

/**
 * Builds a <TreeView> data structure for the given command.
 */
export function buildTree(command: t.ICommand, options: { parent?: t.ITreeNode } = {}) {
  const parent: t.ITreeNode = options.parent || {
    id: `cmd:${command.id}`,
    props: { label: 'Commands' },
  };

  parent.children = command.children.map(cmd => {
    const node: t.ITreeNode = {
      id: `cmd:${cmd.id}`,
      props: {
        label: cmd.name,
        icon: 'Face',
      },
    };

    if (cmd.children.length > 0) {
      buildTree(cmd, { parent: node });
    }
    return node;
  });

  return parent;
}
