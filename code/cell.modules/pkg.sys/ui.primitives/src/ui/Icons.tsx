import { Icon } from '@platform/ui.icon';
import { FiAlertTriangle, FiCopy } from 'react-icons/fi';
import { MdFace, MdLock, MdLockOpen, MdQrCode } from 'react-icons/md';

const icon = Icon.renderer;

export const Icons = {
  AlertTriangle: icon(FiAlertTriangle),
  Copy: icon(FiCopy),
  Face: icon(MdFace),
  QRCode: icon(MdQrCode),
  Lock: { Closed: icon(MdLock), Open: icon(MdLockOpen) },
};
