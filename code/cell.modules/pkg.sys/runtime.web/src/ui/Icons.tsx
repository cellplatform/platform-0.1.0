import { Icon } from '@platform/ui.icon';
import { MdPortableWifiOff, MdWifi } from 'react-icons/md';

const icon = Icon.renderer;

/**
 * Icon collection.
 */
export const Icons = {
  Wifi: { On: icon(MdWifi), Off: icon(MdPortableWifiOff) },
};
