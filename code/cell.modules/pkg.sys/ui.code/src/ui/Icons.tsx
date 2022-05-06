import { Icon } from '@platform/ui.icon';
import { MdWarning } from 'react-icons/md';
import { FiHardDrive } from 'react-icons/fi';

const icon = Icon.renderer;

/**
 * Icon collection.
 */
export const Icons = {
  Warning: icon(MdWarning),
  HardDrive: icon(FiHardDrive),
};
