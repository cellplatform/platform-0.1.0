type O = Record<string, unknown>;

/**
 * An identifiable "node" object.
 */
export type INode<P extends O = O> = { id: string; props?: P };
export type NodeIdentifier<T extends INode = INode> = T | T['id'];

/**
 * An "node" with [props] and [children]
 */
export type ITreeNode<P extends O = O> = INode<P> & { children?: ITreeNode<P>[] };
