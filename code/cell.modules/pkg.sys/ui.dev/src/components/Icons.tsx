import { Icon } from '@platform/ui.icon';
import { FiBox } from 'react-icons/fi';
import { MdClose, MdExpandMore, MdSend } from 'react-icons/md';
import { VscSymbolClass, VscSymbolParameter, VscSymbolVariable } from 'react-icons/vsc';

const icon = Icon.renderer;

/**
 * Icon collection.
 */
export const Icons = {
  Variable: icon(VscSymbolVariable),
  Tree: icon(VscSymbolClass),
  Package: icon(FiBox),
  Text: icon(VscSymbolParameter),
  Send: icon(MdSend),

  Close: icon(MdClose),

  Chevron: {
    Down: icon(MdExpandMore),
  },
};
