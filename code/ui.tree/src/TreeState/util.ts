import { t } from '../common';

type Node = t.ITreeNode;

export function assignProps(of: Node, fn?: (props: t.ITreeNodeProps) => void) {
  of.props = of.props || {};
  if (typeof fn === 'function') {
    fn(of.props);
  }
  return of.props;
}

export function assignChildren<N extends Node>(of: N, fn?: (children: N[]) => void): N[] {
  const children = (of.children = of.children || []) as N[];
  if (typeof fn === 'function') {
    fn(children);
  }
  return of.children as N[];
}

export function isTreeStateInstance(input: any) {
  if (typeof input === 'object') {
    return typeof input.change === 'function' && typeof input.payload === 'function';
  }
  return false;
}
