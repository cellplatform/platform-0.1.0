import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, bundle, WebRuntime, defaultValue } from '../../common';

export type ModuleIconProps = {
  version?: string;
  style?: CssValue;
};

export const ModuleIcon: React.FC<ModuleIconProps> = (props) => {
  const styles = {
    base: css({
      position: 'relative',
      userSelect: 'none',
    }),
    image: css({
      Image: [
        bundle.path('static/images/icon.module.png'),
        bundle.path('static/images/icon.module@2x.png'),
        141,
        95,
      ],
    }),
    version: css({
      Absolute: [15, 0, null, null],
      fontSize: 7,
      opacity: 0.5,
      fontFamily: 'monospace',
      letterSpacing: '-0.5px',
    }),
  };

  const version = props.version || WebRuntime.module.version || '0.0.0';

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.image} />
      <div {...styles.version}>{version}</div>
    </div>
  );
};
