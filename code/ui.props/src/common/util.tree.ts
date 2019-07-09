import * as t from './types';
import { toType } from './util.type';

/**
 * Builds a <TreeView> node structure.
 */
export function buildTree(args: {
  data?: t.PropsData;
  filter?: t.PropFilter;
  parent: t.IPropNode;
  root: t.IPropNode;
  insertable: t.PropDataObjectType[];
  deletable: t.PropDataObjectType[];
  formatNode: (node: t.IPropNode) => t.IPropNode;
}): t.IPropNode {
  const { data, root, formatNode, filter, insertable, deletable } = args;
  let parent = args.parent;

  const createNode = (
    id: string,
    key: string | number,
    value: any,
    options: { action?: t.PropChangeAction } = {},
  ) => {
    // const isInsert = Boolean(options.isInsert);
    const { action } = options;
    const type = toType(value);
    const parentType = parent && parent.data ? parent.data.type : undefined;
    const isDeletable = deletable.includes(parentType as t.PropDataObjectType);
    const data: t.IPropNodeData = { path: id, key, value, type, parentType, action, isDeletable };

    if (filter && !filter(data)) {
      return undefined;
    }

    const isArray = Array.isArray(value);
    const isObject = typeof value === 'object' && !isArray;
    let node: t.IPropNode = formatNode({
      id,
      props: { label: key.toString(), colors: { borderTop: false, borderBottom: false } },
      data,
    });

    if (isObject || isArray) {
      const parent = node;
      const data = value;
      node = buildTree({ data, parent, root, formatNode, filter, insertable, deletable }); // <== RECURSION
    }

    return node;
  };

  if (Array.isArray(data)) {
    const children = data
      .map((value, index) => {
        const id = toChildNodeId(parent.id, index);
        return createNode(id, index, value) as t.IPropNode;
      })
      .filter(e => Boolean(e));
    parent = { ...parent, children };

    if (insertable.includes('array')) {
      const id = toChildNodeId(parent.id, children.length);
      const newNode = createNode(id, data.length, undefined, { action: 'INSERT' });
      if (newNode) {
        parent = { ...parent, children: [...(parent.children || []), newNode] };
      }
    }
  }

  if (typeof data === 'object' && !Array.isArray(data)) {
    const children = Object.keys(data)
      .map(key => {
        const id = toChildNodeId(parent.id, key);
        const value = data[key];
        return createNode(id, key, value) as t.IPropNode;
      })
      .filter(e => Boolean(e));
    parent = { ...parent, children };
  }

  return parent;
}

/**
 * Generates the ID of a child node.
 */
function toChildNodeId(parentId: string, child: string | number) {
  return typeof child === 'number' ? `${parentId}.[${child}]` : `${parentId}.${child}`;
}
