import { Icon } from '@platform/ui.icon';
import {
  MdClose,
  MdSettingsInputAntenna,
  MdPortableWifiOff,
  MdWifi,
  MdLock,
  MdLockOpen,
  MdNoEncryption,
  MdSend,
  MdArrowBack,
  MdArrowForward,
  MdFace,
  MdStorage,
} from 'react-icons/md';
import { FiMic, FiMicOff } from 'react-icons/fi';
import { TiUpload } from 'react-icons/ti';
import { BiBus } from 'react-icons/bi';
import { CgDatabase } from 'react-icons/cg';

const icon = Icon.renderer;

/**
 * Icon collection.
 */
export const Icons = {
  Close: icon(MdClose),
  Antenna: icon(MdSettingsInputAntenna),
  Send: icon(MdSend),
  Face: icon(MdFace),
  Wifi: { On: icon(MdWifi), Off: icon(MdPortableWifiOff) },
  Mic: { On: icon(FiMic), Off: icon(FiMicOff) },
  Lock: { Closed: icon(MdLock), Open: icon(MdLockOpen), No: icon(MdNoEncryption) },
  Upload: { Box: icon(TiUpload) },
  Arrow: { Back: icon(MdArrowBack), Forward: icon(MdArrowForward) },
  Bus: icon(BiBus),
  Filesystem: icon(CgDatabase),
};
