import { createRoot } from './util';
import { t, TreeView } from '../components/common';

export const INLINE_SAMPLE = (() => {
  const node = createRoot([10, 5, 3, 2]);
  const children = node.children as t.ITreeNode[];
  const p = TreeView.util.props;

  children.forEach(node => {
    node.props = { ...p(node), inline: {} };
  });

  p(children[0]).inline = { isOpen: true };
  p(children[0]).label = 'inline open';

  p(children[1]).label = 'inline, custom child';

  children[2].children = undefined;
  p(children[2]).label = 'no children';

  p(children[3]).isEnabled = false;
  p(children[3]).label = 'disabled';

  p(children[4]).chevron = { isVisible: true };
  p(children[4]).header = { parentButton: false };
  p(children[4]).label = 'twisty and drill-in';

  p(children[5]).inline = undefined;
  p(children[5]).isSpinning = true;
  p(children[5]).label = 'spinning, custom child';

  p(children[7]).icon = undefined;
  p(children[7]).label = 'has children, icon';

  children[8].children = undefined;
  p(children[8]).icon = undefined;
  p(children[8]).label = 'no children, no icon';

  p(children[9]).inline = undefined;
  p(children[9]).badge = 5;
  p(children[9]).label = 'badge';

  return node;
})();
