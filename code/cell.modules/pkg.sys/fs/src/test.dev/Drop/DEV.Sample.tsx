import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../common';
import { useDragTarget } from 'sys.ui.primitives/lib/hooks/useDragTarget';

import { SampleManifest } from './DEV.Sample.Manifest';
import { SampleLinks } from './DEV.Sample.Links';

type UrlLink = string;

export type SampleProps = {
  manifest?: t.Manifest;
  links: UrlLink[];
  style?: CssValue;
  onDropped?: (e: t.Dropped) => void;
};

export const Sample: React.FC<SampleProps> = (props) => {
  const { manifest, links = [] } = props;
  const drag = useDragTarget<HTMLDivElement>((e) => props.onDropped?.(e));

  /**
   * [Render]
   */
  const styles = {
    base: css({
      position: 'relative',
      flex: 1,
      Flex: 'horizontal-stretch-stretch',
      fontSize: 14,
    }),
    message: css({ flex: 1, Flex: 'center-center' }),
    left: css({ flex: 1, display: 'flex' }),
    right: css({
      borderLeft: `solid 1px ${color.format(-0.1)}`,
      width: 400,
      padding: 10,
      Scroll: true,
      backgroundColor: color.format(-0.03),
    }),
  };

  const elDrop = drag.isDragOver && <div {...styles.message}>Drop</div>;
  const elDefault = !drag.isDragOver && <div {...styles.message}>Save File (Drag & Drop)</div>;

  return (
    <div {...css(styles.base, props.style)} ref={drag.ref}>
      <div {...styles.left}>
        {elDrop}
        {elDefault}
      </div>
      <div {...styles.right}>
        <SampleManifest manifest={manifest} />
        <SampleLinks links={links} />
      </div>
    </div>
  );
};
