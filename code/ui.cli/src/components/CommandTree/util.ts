import { t } from '../../common';

/**
 * Builds a <TreeView> data structure for the given command.
 */
export function buildTree(command: t.ICommand, options: { parent?: t.ITreeNode } = {}) {
  const parent: t.ITreeNode = options.parent || {
    id: asNodeId(command),
    props: { label: 'Commands' },
  };

  parent.children = command.children.map(cmd => {
    const hasChildren = cmd.children.length > 0;
    const node: t.ITreeNode = {
      id: asNodeId(cmd),
      props: {
        label: cmd.name,
        icon: hasChildren ? 'Namespace' : 'Command',
      },
    };
    if (cmd.children.length > 0) {
      buildTree(cmd, { parent: node }); // <== RECURSION
    }
    return node;
  });

  return parent;
}

/**
 * Converts the given command to a tree-view node ID.
 */
export function asNodeId(command?: t.ICommand) {
  return command ? `cmd:${command.id}` : '';
}

/**
 * Converts the given tree-view node ID to a command ID.
 */
export function asCommandId(node?: string | t.ITreeNode) {
  let id = node ? (typeof node === 'string' ? node : node.id) : undefined;
  id = id ? id.replace(/^cmd\:/, '') : undefined;
  return id === undefined ? -1 : parseInt(id, 10);
}

/**
 * Derive a command from a tree node.
 */
export function asCommand(root: t.ICommand, node?: string | t.ITreeNode) {
  const id = asCommandId(node);
  return root.tree.find(cmd => cmd.id === id);
}
