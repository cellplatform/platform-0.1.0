import { Icon, IIcon, IIconProps } from '@platform/ui.icon';
export { IIcon, IIconProps };

import { GoMarkdown } from 'react-icons/go';

/**
 * Icon collection.
 */
const icon = Icon.renderer;
export class Icons {
  public static Markdown = icon(GoMarkdown);
}
