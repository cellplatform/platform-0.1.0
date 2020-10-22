import * as React from 'react';

import { css, defaultValue, formatColor, t } from '../../common';
import { Cropmarks } from './Cropmarks';
import { Label } from './Label';

export type IContentProps = t.IHostLayout;

/**
 * The Host content.
 */
export const Content: React.FC<IContentProps> = (props = {}) => {
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
      <Label label={props.label} />
      <div {...styles.children}>{props.children}</div>
    </>
  );
};

/**
 * Arrange cropmarks around the content.
 */
const ContentCropmarks: React.FC<IContentProps> = (props = {}) => {
  const cropmarks = defaultValue(props.cropmarks, true);
  if (!cropmarks) {
    return null;
  }

  const abs = props.position?.absolute;
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
