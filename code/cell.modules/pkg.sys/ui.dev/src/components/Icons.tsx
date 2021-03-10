import { Icon } from '@platform/ui.icon';
import { VscSymbolVariable, VscSymbolClass } from 'react-icons/vsc';
import { MdExpandMore, MdClose } from 'react-icons/md';

const icon = Icon.renderer;

/**
 * Icon collection.
 */
export const Icons = {
  Variable: icon(VscSymbolVariable),
  Tree: icon(VscSymbolClass),
  Close: icon(MdClose),

  Chevron: {
    Down: icon(MdExpandMore),
  },
};
