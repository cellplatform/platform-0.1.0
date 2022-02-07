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
} from 'react-icons/md';
import { FiMic, FiMicOff } from 'react-icons/fi';
import { TiUpload } from 'react-icons/ti';
import { BiBus } from 'react-icons/bi';
import { CgDatabase } from 'react-icons/cg';
import { RiTerminalBoxFill } from 'react-icons/ri';
import { HiOutlineDatabase } from 'react-icons/hi';

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
  Terminal: icon(RiTerminalBoxFill),
  Database: icon(HiOutlineDatabase),
  FsDrives: icon(CgDatabase),
};
