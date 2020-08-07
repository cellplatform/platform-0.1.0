import { t } from '../../common';

/**
 * Builds a <TreeView> data structure for the given command.
 */
export function buildTree(command: t.ICommand, options: { parent?: t.ITreeviewNode } = {}) {
  const parent: t.ITreeviewNode = options.parent || {
    id: asTreeNodeId(command),
    props: { treeview: { label: 'Commands', header: { isVisible: false } } },
  };

  parent.children = command.children.map((cmd) => {
    const totalChildren = cmd.children.length;
    const hasChildren = totalChildren > 0;
    const node: t.ITreeviewNode = {
      id: asTreeNodeId(cmd),
      props: {
        treeview: {
          label: cmd.name,
          icon: hasChildren ? 'Namespace' : 'Command',
          // badge: hasChildren ? totalChildren : undefined,
        },
        // cmd,
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
export function asTreeNodeId(command?: t.ICommand) {
  return command ? `cmd:${command.id}` : '';
}

/**
 * Converts the given tree-view node ID to a command ID.
 */
export function asCommandId(node?: string | t.ITreeviewNode) {
  let id = node ? (typeof node === 'string' ? node : node.id) : undefined;
  id = id ? id.replace(/^cmd\:/, '') : undefined;
  return id === undefined ? -1 : parseInt(id, 10);
}

/**
 * Derive a command from a tree node.
 */
export function asCommand(root: t.ICommand, node?: string | t.ITreeviewNode) {
  const id = asCommandId(node);
  return root.tree.find((cmd) => cmd.id === id);
}
