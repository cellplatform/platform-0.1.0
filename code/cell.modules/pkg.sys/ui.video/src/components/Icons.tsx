import { Icon } from '@platform/ui.icon';
import { MdExpandMore, MdClose } from 'react-icons/md';
import { FiMic, FiMicOff } from 'react-icons/fi';

const icon = Icon.renderer;

/**
 * Icon collection.
 */
export const Icons = {
  Close: icon(MdClose),

  Mic: {
    On: icon(FiMic),
    Off: icon(FiMicOff),
  },

  Chevron: {
    Down: icon(MdExpandMore),
  },
};
