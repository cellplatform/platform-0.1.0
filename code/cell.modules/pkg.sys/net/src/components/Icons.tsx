import { Icon } from '@platform/ui.icon';
import {
  MdClose,
  MdSettingsInputAntenna,
  MdPortableWifiOff,
  MdWifi,
  MdLock,
  MdLockOpen,
  MdNoEncryption,
} from 'react-icons/md';
import { FiMic, FiMicOff } from 'react-icons/fi';

const icon = Icon.renderer;

/**
 * Icon collection.
 */
export const Icons = {
  Close: icon(MdClose),
  Antenna: icon(MdSettingsInputAntenna),
  Wifi: { On: icon(MdWifi), Off: icon(MdPortableWifiOff) },
  Mic: { On: icon(FiMic), Off: icon(FiMicOff) },
  Lock: { Closed: icon(MdLock), Open: icon(MdLockOpen), No: icon(MdNoEncryption) },
};
