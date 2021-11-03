import React from 'react';
import { css, CssValue, t, QRCode } from '../common';

type Url = string;

export type InfoProps = {
  manifestUrl: Url;
  manifest: t.ModuleManifest;
  size?: number;
  style?: CssValue;
};

export const Info: React.FC<InfoProps> = (props) => {
  const { manifest, manifestUrl, size = 50 } = props;

  const module = manifest.module;
  const version = module?.version ?? '0.0.0';

  const styles = {
    base: css({}),
    version: css({
      marginTop: 2,
      fontFamily: 'monospace',
      textAlign: 'center',
      fontSize: 9,
    }),
  };
  return (
    <div {...css(styles.base, props.style)}>
      <QRCode value={manifestUrl} size={size} />
      <div {...styles.version}>{version}</div>
    </div>
  );
};
