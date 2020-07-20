import { t } from '../common';

type N = t.ITreeNode;

export const helpers = {
  /**
   * Props helper.
   */
  props(of: N, fn?: (props: t.ITreeNodeProps) => void): t.ITreeNodeProps {
    of.props = of.props || {};
    if (typeof fn === 'function') {
      fn(of.props);
    }
    return of.props;
  },
};
