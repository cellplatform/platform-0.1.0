import * as t from './types';
import { getType } from './util.type';

/**
 * Builds a <TreeView> node structure.
 */
export function buildTree(args: {
  data?: t.PropsData;
  filter?: t.PropFilter;
  parent: t.IPropNode;
  root: t.IPropNode;
  insert: t.PropInsertType[];
  formatNode: (node: t.IPropNode) => t.IPropNode;
}): t.IPropNode {
  const { data, root, formatNode, filter, insert } = args;
  let parent = args.parent;

  const createNode = (
    id: string,
    key: string | number,
    value: any,
    options: { isInsert?: boolean } = {},
  ) => {
    const isInsert = Boolean(options.isInsert);
    const type = getType(value);
    const parentType = parent && parent.data ? parent.data.type : undefined;
    const data: t.IPropNodeData = { path: id, key, value, type, parentType, isInsert };

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
      node = buildTree({ data, parent, root, formatNode, filter, insert }); // <== RECURSION
    }

    return node;
  };

  if (Array.isArray(data)) {
    const children = data
      .map((value, index) => {
        const id = `${parent.id}.[${index}]`;
        return createNode(id, index, value) as t.IPropNode;
      })
      .filter(e => Boolean(e));
    parent = { ...parent, children };

    if (insert.includes('array')) {
      const id = `${parent.id}.[${children.length}]`;
      const newNode = createNode(id, data.length, undefined, { isInsert: true });
      if (newNode) {
        parent = { ...parent, children: [...(parent.children || []), newNode] };
      }
    }
  }

  if (typeof data === 'object' && !Array.isArray(data)) {
    const children = Object.keys(data)
      .map(key => {
        const id = `${parent.id}.${key}`;
        const value = data[key];
        return createNode(id, key, value) as t.IPropNode;
      })
      .filter(e => Boolean(e));

    parent = { ...parent, children };
  }

  return parent;
}
