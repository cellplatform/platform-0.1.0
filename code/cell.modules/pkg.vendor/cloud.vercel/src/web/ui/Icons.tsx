import { Icon } from '@platform/ui.icon';
import { MdWarning } from 'react-icons/md';
import { FiHardDrive } from 'react-icons/fi';
import { FaLink } from 'react-icons/fa';

const icon = Icon.renderer;

/**
 * Icon collection.
 */
export const Icons = {
  Warning: icon(MdWarning),
  HardDrive: icon(FiHardDrive),
  Link: icon(FaLink),
};
