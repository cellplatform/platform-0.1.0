import * as React from 'react';

import { css, defaultValue, formatColor, t } from '../../common';
import { Cropmarks } from './Cropmarks';
import { Labels } from './Labels';

export type ContentProps = t.IDevHostedLayout;

/**
 * The Host content.
 */
export const Content: React.FC<ContentProps> = (props = {}) => {
  if (!props.children) {
    return null;
  }

  const styles = {
    children: css({
      position: 'relative',
      width: props.width,
      height: props.height,
      WebkitAppRegion: 'none',
      boxSizing: 'border-box',
      flex: 1,
    }),
  };

  return (
    <>
      <ContentCropmarks {...props} />
      <Labels label={props.label} />
      <div {...styles.children}>{props.children}</div>
    </>
  );
};

/**
 * Arrange cropmarks around the content.
 */
const ContentCropmarks: React.FC<ContentProps> = (props = {}) => {
  const cropmarks = defaultValue(props.cropmarks, true);
  if (!cropmarks) {
    return null;
  }

  const abs = props.position;
  const color = formatColor(cropmarks === true ? 1 : cropmarks);

  const size = 20;
  const margin = 6;
  const offset = size + margin;

  // Ensure the space surrounding an "absolute positioning" is
  // not less than offset space of the cropmarks.
  if (abs && Object.keys(abs).some((key) => abs[key] < offset)) {
    return null;
  }

  return <Cropmarks color={color} margin={margin} size={size} />;
};
