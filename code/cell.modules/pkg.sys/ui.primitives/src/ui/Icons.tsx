import { Icon } from '@platform/ui.icon';
import { FiAlertTriangle } from 'react-icons/fi';
import { MdFace, MdLock, MdLockOpen, MdQrCode } from 'react-icons/md';
import { RiFileCopyFill } from 'react-icons/ri';

const icon = Icon.renderer;

export const Icons = {
  AlertTriangle: icon(FiAlertTriangle),
  Copy: icon(RiFileCopyFill),
  Face: icon(MdFace),
  QRCode: icon(MdQrCode),
  Lock: { Closed: icon(MdLock), Open: icon(MdLockOpen) },
};
