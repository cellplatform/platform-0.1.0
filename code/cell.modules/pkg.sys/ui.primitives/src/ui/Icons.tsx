import { Icon } from '@platform/ui.icon';
import { FiAlertTriangle } from 'react-icons/fi';
import { MdArrowBack, MdArrowForward, MdFace, MdLock, MdLockOpen, MdQrCode } from 'react-icons/md';
import { RiFileCopyFill, RiTerminalBoxFill } from 'react-icons/ri';
import { VscSymbolEvent } from 'react-icons/vsc';

const icon = Icon.renderer;

export const Icons = {
  AlertTriangle: icon(FiAlertTriangle),
  Copy: icon(RiFileCopyFill),
  Face: icon(MdFace),
  QRCode: icon(MdQrCode),
  Lock: { Closed: icon(MdLock), Open: icon(MdLockOpen) },
  Terminal: icon(RiTerminalBoxFill),
  Arrow: { Back: icon(MdArrowBack), Forward: icon(MdArrowForward) },
  Event: icon(VscSymbolEvent),
};
