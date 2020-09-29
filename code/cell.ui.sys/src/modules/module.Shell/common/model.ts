import * as t from './types';
import { DEFAULT } from './constants';

type S = t.ITreeNode<t.ShellProps>;

/**
 * Helpers for working with the data model.
 */
export const model = {
  props: (shell: S) => shell.props || (shell.props = {}),
  data(shell: S) {
    const props = model.props(shell);
    return props.data || (props.data = DEFAULT.DATA);
  },
};
