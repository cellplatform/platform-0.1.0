import * as React from 'react';
import { t } from '../../common';

import { IconView, IconProps, IconComponent } from './IconView';
export { IconProps, IconComponent };

export const Icon = {
  View: IconView,

  renderer(type: IconComponent): t.IIcon {
    return (props: t.IIconProps) => <IconView type={type} {...props} />; // eslint-disable-line
  },
};
