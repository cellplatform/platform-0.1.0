import { Icon } from '@platform/ui.icon';
import { FiWifi, FiAlertTriangle } from 'react-icons/fi';
import { MdClose } from 'react-icons/md';
import { GoSquirrel } from 'react-icons/go';

/**
 * Icon collection.
 */
const icon = Icon.renderer;
export class Icons {
  public static Wifi = icon(FiWifi);
  public static AlertTriangle = icon(FiAlertTriangle);
  public static Close = icon(MdClose);
  public static Squirrel = icon(GoSquirrel);
}
