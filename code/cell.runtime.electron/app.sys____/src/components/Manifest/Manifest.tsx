import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, COLORS } from '../../common';

import { ManifestHeader } from './Manifest.Header';
import { ManifestFiles } from './Manifest.Files';

export type ManifestProps = {
  manifest?: t.BundleManifest;
  style?: CssValue;
};

export const Manifest: React.FC<ManifestProps> = (props) => {
  const { manifest } = props;

  const styles = {
    base: css({
      position: 'relative',
      // backgroundColor: 'rgba(255, 0, 0, 0.1)' /* RED */,
      width: 400,
      height: 400,
      boxSizing: 'border-box',
      color: COLORS.DARK,
    }),
    empty: css({
      Absolute: 0,
      Flex: 'center-center',
      fontSize: 14,
      fontStyle: 'italic',
      color: color.format(-0.4),
      userSelect: 'none',
    }),
    body: {
      base: css({
        Absolute: 0,
        Flex: 'vertical-stretch-stretch',
      }),
      header: css({
        position: 'relative',
        padding: 12,
        borderBottom: `solid 5px ${color.format(-0.1)}`,
      }),
      main: css({
        position: 'relative',
        flex: 1,
        padding: 8,
        Flex: 'center-center',
      }),
    },
  };

  const elEmpty = !manifest && <div {...styles.empty}>No manifest to display.</div>;

  const elBody = manifest && (
    <div {...styles.body.base}>
      <div {...styles.body.header}>
        <ManifestHeader manifest={manifest} />
      </div>
      <div {...styles.body.main}>
        <ManifestFiles manifest={manifest} style={css({ Absolute: 0 })} />
      </div>
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elEmpty}
      {elBody}
    </div>
  );
};
