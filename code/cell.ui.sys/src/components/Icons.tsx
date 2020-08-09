import { Icon } from '@platform/ui.icon';
import { FiAlertTriangle, FiWifi, FiZap, FiSettings } from 'react-icons/fi';
import { GoSquirrel } from 'react-icons/go';
import { MdClose, MdRefresh } from 'react-icons/md';

/**
 * Icon collection.
 */
const icon = Icon.renderer;
export class Icons {
  public static Wifi = icon(FiWifi);
  public static AlertTriangle = icon(FiAlertTriangle);
  public static Close = icon(MdClose);
  public static Squirrel = icon(GoSquirrel);
  public static Refresh = icon(MdRefresh);
  public static Event = icon(FiZap);
  public static Settings = icon(FiSettings);
}
