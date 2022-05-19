import { Icon } from '@platform/ui.icon';
import { FiAlertTriangle } from 'react-icons/fi';
import { MdFace, MdLock, MdLockOpen, MdQrCode, MdExtension } from 'react-icons/md';

const icon = Icon.renderer;

export const Icons = {
  AlertTriangle: icon(FiAlertTriangle),
  Face: icon(MdFace),
  QRCode: icon(MdQrCode),
  Lock: { Closed: icon(MdLock), Open: icon(MdLockOpen) },
  LegoBlock: icon(MdExtension),
};
