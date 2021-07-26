import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';

export type PositioningLayersProps = { style?: CssValue };

export const PositioningLayers: React.FC<PositioningLayersProps> = (props) => {
  const styles = { base: css({}) };
  return <div {...css(styles.base, props.style)}>PositioningLayers</div>;
};
