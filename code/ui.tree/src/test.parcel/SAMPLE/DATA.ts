import { createRoot } from './util';
import { t } from '../../common';
import { Treeview } from '../..';
import { COLORS } from '../constants';

export const SIMPLE: t.ITreeviewNode = {
  id: 'root',
  props: {
    treeview: {
      label: 'Sheet',
      icon: 'Face',
    },
  },
  children: [
    { id: 'child-1', props: { treeview: { icon: 'Face', marginTop: 30 } } },
    { id: 'child-2', props: { treeview: { icon: 'Face' } } },
    { id: 'child-3', props: { treeview: { icon: 'Face' } } },
    { id: 'child-4', props: { treeview: { icon: 'Face' } } },
    { id: 'child-5', props: { treeview: { icon: 'Face' } } },
  ],
};

export const COMPREHENSIVE = (() => {
  const props = Treeview.util.props;

  const root = createRoot([21, 5, 3, 2]);
  props(root).header = { marginBottom: 30 };

  const children = root.children as t.ITreeviewNode[];
  children.forEach((node) => {
    props(node, (props) => (props.inline = {}));
  });

  props(children[0]).inline = { isOpen: true };
  props(children[0]).label = 'inline open';

  props(children[1]).label = 'custom child, inline';
  props(children[1]).icon = 'Box';

  props(children[2]).inline = undefined;
  props(children[2]).label = 'custom child/header, drill-in';
  props(children[2]).header = { showParentButton: false, height: 80 };
  props(children[2]).icon = '404'; // Icon not found.

  props(children[3]).isEnabled = false;
  props(children[3]).label = 'disabled';
  props(children[3]).chevron = { isVisible: true };
  props(children[3]).marginTop = 20;

  props(children[4]).chevron = { isVisible: true };
  props(children[4]).label = 'twisty and drill-in';
  props(children[4]).header = { marginBottom: 30, height: 80 };

  props(children[5]).inline = undefined;
  props(children[5]).isSpinning = true;
  props(children[5]).label = 'spinning';

  children[6].children = undefined;
  props(children[6]).label = 'no children';

  props(children[7]).icon = undefined;
  props(children[7]).label = 'has children, no icon';

  children[8].children = undefined;
  props(children[8]).icon = undefined;
  props(children[8]).label = 'no children, no icon';

  props(children[9]).inline = undefined;
  props(children[9]).badge = 5;
  props(children[9]).label = 'badge';

  props(children[10]).label = 'opacity: 0.6';
  props(children[10]).inline = undefined;
  props(children[10]).opacity = 0.6;

  props(children[11]).label = 'icon color';
  props(children[11]).colors = { icon: COLORS.BLUE };

  props(children[12]).label = 'label color';
  props(children[12]).colors = { label: COLORS.BLUE };

  props(children[13]).label = 'Description';
  props(children[13]).description =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque nec quam lorem. Praesent fermentum, augue ut porta varius.';
  // p(children[13]).descriptionColor = -0.3;
  // p(children[13]).marginBottom = 80;

  props(children[14]).body = 'CUSTOM';
  props(children[14]).label = 'Custom Body';

  props(children[15]).body = 'CUSTOM';
  props(children[15]).label = 'Custom Body';
  props(children[15]).badge = 123;
  props(children[15]).icon = undefined;
  props(children[15]).inline = undefined;

  props(children[16]).body = 'CUSTOM';
  props(children[16]).label = 'Custom Body';
  props(children[16]).isSpinning = true;
  props(children[16]).chevron = { isVisible: true };

  props(children[17]).label = 'Color Props';
  props(children[17]).chevron = { isVisible: true };
  props(children[17]).colors = {
    label: COLORS.WHITE,
    icon: COLORS.PINK,
    bg: -0.8,
    twisty: COLORS.CYAN,
    chevron: COLORS.PINK,
  };
  props(children[17]).focusColors = {
    label: COLORS.WHITE,
    bg: COLORS.BLUE,
  };

  props(children[18]).label = 'editable';
  props(children[18]).labelEditable = true;

  props(children[19]).label = 'dbl-click to edit';
  props(children[19]).labelEditable = 'DOUBLE_CLICK';

  props(children[20]).inline = { isOpen: true };
  props(children[20]).label = 'inline open';
  props(children[20]).colors = { borderBottom: -0.1 }; // No bottom border by default.
  props(children[20]).marginBottom = 80;

  // p(children[18]).inline = { isOpen: true };

  return root;
})();
