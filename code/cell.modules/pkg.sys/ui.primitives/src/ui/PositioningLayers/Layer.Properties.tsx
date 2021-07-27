import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';

export type LayerPropertiesProps = { style?: CssValue };

export const LayerProperties: React.FC<LayerPropertiesProps> = (props) => {
  const styles = {
    base: css({
      backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <div>LayerProperties</div>
    </div>
  );
};
