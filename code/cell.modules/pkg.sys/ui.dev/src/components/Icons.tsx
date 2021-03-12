import { Icon } from '@platform/ui.icon';
import { VscSymbolVariable, VscSymbolClass } from 'react-icons/vsc';
import { MdExpandMore, MdClose } from 'react-icons/md';
import { FiBox } from 'react-icons/fi';

const icon = Icon.renderer;

/**
 * Icon collection.
 */
export const Icons = {
  Variable: icon(VscSymbolVariable),
  Tree: icon(VscSymbolClass),
  Package: icon(FiBox),

  Close: icon(MdClose),

  Chevron: {
    Down: icon(MdExpandMore),
  },
};
