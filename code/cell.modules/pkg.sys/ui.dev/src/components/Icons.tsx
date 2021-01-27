import { Icon } from '@platform/ui.icon';
import { VscSymbolVariable } from 'react-icons/vsc';
import { MdExpandMore } from 'react-icons/md';

const icon = Icon.renderer;

/**
 * Icon collection.
 */
export const Icons = {
  Variable: icon(VscSymbolVariable),

  Chevron: {
    Down: icon(MdExpandMore),
  },
};
