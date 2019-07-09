import { Icon, IIcon, IIconProps } from '@platform/ui.icon';
export { IIcon, IIconProps };

import { FiTrash2, FiBox, FiLayers, FiGitPullRequest } from 'react-icons/fi';

/**
 * Icon collection.
 */
const icon = Icon.renderer;
export class Icons {
  // Feather.
  public static Object = icon(FiBox);
  public static Array = icon(FiLayers);
  public static Function = icon(FiGitPullRequest);
  public static Delete = icon(FiTrash2);
}
