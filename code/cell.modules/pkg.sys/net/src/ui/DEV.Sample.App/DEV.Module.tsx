import React from 'react';
import { Module } from 'sys.runtime.web.ui/lib/ui/Module';

import { css, CssValue, t } from './DEV.common';

export type DevModuleProps = {
  bus: t.EventBus<any>;
  url?: string; // https://<DOMAIN>/index.json?entry=./App'
  style?: CssValue;
};

export const DevModule: React.FC<DevModuleProps> = (props) => {
  const { bus, url } = props;

  /**
   * [Render]
   */
  const styles = {
    base: css({ flex: 1, position: 'relative' }),
    module: css({ Absolute: 0, pointerEvents: 'auto' }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <Module instance={{ bus }} url={url} style={styles.module} />
    </div>
  );
};
