import { createRoot } from './util';
import { t, TreeView, COLORS } from '../common';

export const SIMPLE: t.ITreeNode = {
  id: 'root',
  props: {
    label: 'Sheet',
    icon: 'Face',
  },
  children: [
    { id: 'child-1', props: { icon: 'Face', marginTop: 30 } },
    { id: 'child-2', props: { icon: 'Face' } },
    { id: 'child-3', props: { icon: 'Face' } },
    { id: 'child-4', props: { icon: 'Face' } },
    { id: 'child-5', props: { icon: 'Face' } },
  ],
};

export const COMPREHENSIVE = (() => {
  const p = TreeView.util.props;
  const root = createRoot([18, 5, 3, 2]);

  // p(root).header = { isVisible: false };

  const children = root.children as t.ITreeNode[];
  children.forEach(node => {
    node.props = { ...p(node), inline: {} };
  });

  p(children[0]).inline = { isOpen: true };
  p(children[0]).label = 'inline open';
  p(children[0]).marginTop = 30;

  p(children[1]).label = 'custom child, inline';

  p(children[2]).inline = undefined;
  p(children[2]).label = 'custom child, drill-in';
  p(children[2]).header = { parentButton: false };

  p(children[3]).isEnabled = false;
  p(children[3]).label = 'disabled';
  p(children[3]).chevron = { isVisible: true };

  p(children[4]).chevron = { isVisible: true };
  p(children[4]).label = 'twisty and drill-in';

  p(children[5]).inline = undefined;
  p(children[5]).isSpinning = true;
  p(children[5]).label = 'spinning';

  children[6].children = undefined;
  p(children[6]).label = 'no children';

  p(children[7]).icon = undefined;
  p(children[7]).label = 'has children, no icon';

  children[8].children = undefined;
  p(children[8]).icon = undefined;
  p(children[8]).label = 'no children, no icon';

  p(children[9]).inline = undefined;
  p(children[9]).badge = 5;
  p(children[9]).label = 'badge';

  p(children[10]).label = 'opacity: 0.6';
  p(children[10]).inline = undefined;
  p(children[10]).opacity = 0.6;

  p(children[11]).label = 'icon color';
  p(children[11]).colors = { icon: COLORS.BLUE };

  p(children[12]).label = 'label color';
  p(children[12]).colors = { label: COLORS.BLUE };

  p(children[13]).label = 'Description';
  p(children[13]).description =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nec quam lorem. Praesent fermentum, augue ut porta varius.';
  // p(children[13]).descriptionColor = -0.3;
  // p(children[13]).marginBottom = 80;

  p(children[14]).body = 'CUSTOM';
  p(children[14]).label = 'Custom Body';

  p(children[15]).body = 'CUSTOM';
  p(children[15]).label = 'Custom Body';
  p(children[15]).badge = 123;
  p(children[15]).icon = undefined;
  p(children[15]).inline = undefined;

  p(children[16]).body = 'CUSTOM';
  p(children[16]).label = 'Custom Body';
  p(children[16]).isSpinning = true;
  p(children[16]).chevron = { isVisible: true };

  p(children[17]).label = 'Color Props';
  p(children[17]).chevron = { isVisible: true };
  p(children[17]).colors = {
    label: COLORS.WHITE,
    icon: COLORS.PINK,
    bg: -0.8,
    twisty: COLORS.CYAN,
    chevron: COLORS.PINK,
  };
  p(children[17]).focusColors = {
    label: COLORS.WHITE,
    // icon: COLORS.PINK,
    bg: COLORS.BLUE,
  };
  p(children[17]).marginBottom = 80;

  return root;
})();
