import { Icon } from '@platform/ui.icon';
import { FiAlertTriangle, FiCopy } from 'react-icons/fi';
import { RiFileCopyFill } from 'react-icons/ri';
import { MdFace, MdLock, MdLockOpen, MdQrCode, MdOutlineContentCopy } from 'react-icons/md';

const icon = Icon.renderer;

export const Icons = {
  AlertTriangle: icon(FiAlertTriangle),
  Copy: icon(RiFileCopyFill),
  Face: icon(MdFace),
  QRCode: icon(MdQrCode),
  Lock: { Closed: icon(MdLock), Open: icon(MdLockOpen) },
};
