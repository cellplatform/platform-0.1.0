import { Icon } from '@platform/ui.icon';
import { BiExtension, BiSidebar } from 'react-icons/bi';
import { FiBox } from 'react-icons/fi';
import {
  MdCheck,
  MdClose,
  MdDoNotDisturb,
  MdExpandMore,
  MdExtension,
  MdFullscreen,
  MdFullscreenExit,
  MdKeyboardCapslock,
  MdSend,
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
  Skip: icon(MdDoNotDisturb),
  Chevron: { Down: icon(MdExpandMore) },
  Fullscreen: { Enter: icon(MdFullscreen), Exit: icon(MdFullscreenExit) },
  Compose: { Solid: icon(MdExtension), Outline: icon(BiExtension) },
  Keyboard: { CapsLock: icon(MdKeyboardCapslock) },
  Sidebar: icon(BiSidebar),
};
