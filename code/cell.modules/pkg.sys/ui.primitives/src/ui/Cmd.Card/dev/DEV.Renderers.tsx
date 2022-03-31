import React from 'react';
import { color, COLORS, css, t } from '../common';

/**
 * BACKDROP
 */
export const renderSampleBackdrop: t.CmdCardRender = (e) => {
  const styles = {
    base: css({
      Absolute: 10,
      Size: e.size,
      Flex: 'center-center',
      color: color.format(1),
      border: `dashed 1px ${color.format(0.3)}`,
      backgroundColor: 'rgba(255, 0, 0, 0.06)' /* RED */,
      borderRadius: 5,
    }),
  };
  return <div {...styles.base}>{`"My Backdrop"`}</div>;
};

/**
 * BODY
 */
export const renderSampleBody: t.CmdCardRender = (e) => {
  const styles = {
    base: css({
      Absolute: 10,
      Size: e.size,
      Flex: 'center-center',
      border: `dashed 1px ${color.format(-0.2)}`,
      backgroundColor: 'rgba(255, 0, 0, 0.02)' /* RED */,
      borderRadius: 15,
    }),
  };
  return <div {...styles.base}>{`"My Body"`}</div>;
};

/**
 * INDEX
 */
export const SampleRenderer = {
  body: renderSampleBody,
  backdrop: renderSampleBackdrop,
};
