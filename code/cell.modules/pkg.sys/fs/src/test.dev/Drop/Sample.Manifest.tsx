import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../common';
import { ObjectView } from 'sys.ui.dev';

export type SampleManifestProps = {
  manifest?: t.Manifest;
  style?: CssValue;
};

export const SampleManifest: React.FC<SampleManifestProps> = (props) => {
  const { manifest } = props;

  const files = manifest?.files.map((e) => {
    const hash = `${e.filehash.substring(0, 15)}..${e.filehash.substring(e.filehash.length - 8)}`;
    return {
      path: e.path,
      hash,
      bytes: e.bytes,
    };
  });

  const data = { files };

  const styles = {
    base: css({
      overflow: 'hidden',
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <ObjectView name={'manifest'} data={data} fontSize={10} expandLevel={3} />
    </div>
  );
};
