import { Icon } from '@platform/ui.icon';
import { FiMic, FiMicOff } from 'react-icons/fi';
import { MdPortableWifiOff, MdWifi } from 'react-icons/md';

const icon = Icon.renderer;

/**
 * Icon collection.
 */
export const Icons = {
  Wifi: { On: icon(MdWifi), Off: icon(MdPortableWifiOff) },
  Mic: { On: icon(FiMic), Off: icon(FiMicOff) },
};
