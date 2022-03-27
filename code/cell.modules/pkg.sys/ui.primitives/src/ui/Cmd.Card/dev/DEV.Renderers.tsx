import React from 'react';

import { COLORS, css, t } from '../common';

export const renderSampleBackdrop: t.CmdCardRender = (e) => {
  const styles = {
    base: css({
      Absolute: 0,
      Size: e.size,
      Flex: 'center-center',
      color: COLORS.WHITE,
    }),
  };
  return <div {...styles.base}>{`"My Backdrop"`}</div>;
};

export const renderSampleBody: t.CmdCardRender = (e) => {
  const styles = {
    base: css({
      Absolute: 0,
      Size: e.size,
      Flex: 'center-center',
    }),
  };
  return <div {...styles.base}>{`"My Body"`}</div>;
};
