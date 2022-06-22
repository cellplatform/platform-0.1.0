import React, { useEffect, useRef, useState } from 'react';
import { Color, COLORS, css, CssValue, t, rx } from '../../common';

export type TalkingDiagramProps = { style?: CssValue };

export const TalkingDiagram: React.FC<TalkingDiagramProps> = (props) => {
  /**
   * [Render]
   */
  const styles = {
    base: css({ backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */ }),
  };
  return <div {...css(styles.base, props.style)}>TalkingDiagram</div>;
};
