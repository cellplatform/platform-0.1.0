import * as React from 'react';

import { css, defaultValue, formatColor, t } from '../../common';
import { Cropmarks } from './Cropmarks';
import { Labels } from './Labels';

export type ContentCropmark = { size: number; margin: number };

export type ContentProps = {
  cropmark: ContentCropmark;
  layout: t.IDevHostedLayout;
};

/**
 * The Host content.
 */
export const Content: React.FC<ContentProps> = (props) => {
  if (!props.children) return null;
  const { layout } = props;

  const styles = {
    children: css({
      flex: 1,
      position: 'relative',
      width: layout.width,
      height: layout.height,
      WebkitAppRegion: 'none',
      boxSizing: 'border-box',
    }),
  };

  return (
    <>
      <ContentCropmarks {...props} />
      <Labels label={layout.label} />
      <div {...styles.children}>{props.children}</div>
    </>
  );
};

/**
 * Arrange cropmarks around the content.
 */
const ContentCropmarks: React.FC<ContentProps> = (props) => {
  const { layout } = props;
  const cropmarks = defaultValue(layout.cropmarks, true);
  if (!cropmarks) return null;

  const abs = layout.position;
  const color = formatColor(cropmarks === true ? 1 : cropmarks);

  const size = props.cropmark.size;
  const margin = props.cropmark.margin;
  const offset = size + margin;

  // Ensure the space surrounding an "absolute positioning" is
  // not less than offset space of the cropmarks.
  if (abs && Object.keys(abs).some((key) => abs[key] < offset)) {
    return null;
  }

  return <Cropmarks color={color} margin={margin} size={size} />;
};
