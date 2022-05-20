import { Icon } from '@platform/ui.icon';
import { BiBus } from 'react-icons/bi';
import { CgDatabase } from 'react-icons/cg';
import { FaNetworkWired } from 'react-icons/fa';
import { FiMic, FiMicOff } from 'react-icons/fi';
import { GrNetworkDrive } from 'react-icons/gr';
import { HiOutlineDatabase } from 'react-icons/hi';
import {
  MdArrowBack,
  MdArrowForward,
  MdClose,
  MdFace,
  MdFullscreen,
  MdFullscreenExit,
  MdHelpOutline,
  MdKeyboard,
  MdLock,
  MdLockOpen,
  MdMore,
  MdNoEncryption,
  MdOpenInFull,
  MdOutlineScreenShare,
  MdOutlineStopScreenShare,
  MdPortableWifiOff,
  MdSend,
  MdSettingsInputAntenna,
  MdWifi,
} from 'react-icons/md';
import { TiUpload } from 'react-icons/ti';

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
  Database: icon(HiOutlineDatabase),
  FsDrives: icon(CgDatabase),
  FsNetworkDrive: icon(GrNetworkDrive),
  Unknown: icon(MdHelpOutline),
  Network: icon(FaNetworkWired),
  Keyboard: icon(MdKeyboard),
  More: icon(MdMore),
  FullScreen: { Open: icon(MdFullscreen), Exit: icon(MdFullscreenExit) },
  Window: { Expand: icon(MdOpenInFull) },
  ScreenShare: { Start: icon(MdOutlineScreenShare), Stop: icon(MdOutlineStopScreenShare) },
};
