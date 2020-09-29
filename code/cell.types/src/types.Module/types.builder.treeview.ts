

/**
 * Builder API for a treeview node.
 * Generics:
 *    <P> Parent builder type
 */
export type ITreeviewNodeBuilder<P> = {
  parent(): P;
  label(value: string): ITreeviewNodeBuilder<P>;
};
