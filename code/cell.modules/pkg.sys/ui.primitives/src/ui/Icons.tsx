import { Icon } from '@platform/ui.icon';
import { BsKeyboard, BsKeyboardFill } from 'react-icons/bs';
import { FiAlertTriangle } from 'react-icons/fi';
import {
  MdArrowBack,
  MdArrowForward,
  MdClose,
  MdFace,
  MdLock,
  MdLockOpen,
  MdQrCode,
  MdVisibility,
  MdVisibilityOff,
} from 'react-icons/md';
import { RiFileCopyFill, RiTerminalBoxFill } from 'react-icons/ri';
import { VscSymbolEvent } from 'react-icons/vsc';

const icon = Icon.renderer;

export const Icons = {
  AlertTriangle: icon(FiAlertTriangle),
  Copy: icon(RiFileCopyFill),
  Face: icon(MdFace),
  Close: icon(MdClose),
  QRCode: icon(MdQrCode),
  Lock: { Closed: icon(MdLock), Open: icon(MdLockOpen) },
  Terminal: icon(RiTerminalBoxFill),
  Arrow: { Back: icon(MdArrowBack), Forward: icon(MdArrowForward) },
  Event: icon(VscSymbolEvent),
  Keyboard: { fill: icon(BsKeyboardFill), outline: icon(BsKeyboard) },
  Visibility: { On: icon(MdVisibility), Off: icon(MdVisibilityOff) },
};
