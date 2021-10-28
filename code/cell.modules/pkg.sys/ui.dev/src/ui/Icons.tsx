import { Icon } from '@platform/ui.icon';
import { FiBox } from 'react-icons/fi';
import {
  MdCheck,
  MdClose,
  MdExpandMore,
  MdSend,
  MdFullscreen,
  MdFullscreenExit,
} from 'react-icons/md';
import {
  VscChecklist,
  VscSymbolClass,
  VscSymbolParameter,
  VscSymbolVariable,
} from 'react-icons/vsc';

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
  Checklist: icon(VscChecklist),
  Close: icon(MdClose),
  Tick: icon(MdCheck),
  Chevron: { Down: icon(MdExpandMore) },
  Fullscreen: { Enter: icon(MdFullscreen), Exit: icon(MdFullscreenExit) },
};
