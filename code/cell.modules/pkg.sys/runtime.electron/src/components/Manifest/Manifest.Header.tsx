import React, { useEffect, useRef, useState } from 'react';
import { filesize, color, css, CssValue, t, PropList, PropListItem, COLORS } from '../../common';

import { QRCode } from 'sys.ui.primitives/lib/components/QRCode';

export type ManifestHeaderProps = {
  manifest: t.ModuleManifest;
  style?: CssValue;
};

export const ManifestHeader: React.FC<ManifestHeaderProps> = (props) => {
  const { manifest } = props;
  const hash = manifest.hash.module;

  const totalBytes = manifest.files.reduce((acc, next) => acc + next.bytes, 0);
  const size = filesize(totalBytes, { round: 1 });

  const styles = {
    base: css({ Flex: 'horizontal-stretch-start' }),
    qr: css({ position: 'relative', width: 180 }),
  };

  const items: PropListItem[] = [
    {
      label: 'hash (sha256)',
      value: {
        data: shorten(hash.replace(/^sha256-/, ''), 20),
        clipboard: hash,
        monospace: true,
      },
    },
    { label: 'namespace', value: manifest.module.namespace },
    { label: 'version', value: manifest.module.version },
    { label: 'compilation', value: `${manifest.module.target}:${manifest.module.mode} (${size})` },
  ];

  const elQRCode = (
    <div {...styles.qr}>
      <QRCode value={hash} size={100} />
    </div>
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elQRCode}
      <PropList title={'Module Bundle'} items={items} defaults={{ clipboard: false }} />
    </div>
  );
};

/**
 * [Helpers]
 */

const shorten = (text: string, max: number) => {
  if (text.length < max) {
    return text;
  } else {
    const DIV = '..';
    const length = max / 2 - DIV.length / 2;
    const left = text.substring(0, length);
    const right = text.substring(text.length - length);

    const styles = {
      base: css({
        Flex: 'horizontal-center-center',
        fontFamily: 'monospace',
        cursor: 'pointer',
      }),
      edge: css({ color: COLORS.CYAN }),
      left: css({}),
      right: css({}),
      div: css({ opacity: 0.4 }),
    };

    return (
      <div {...styles.base}>
        <div {...css(styles.edge, styles.left)}>{left}</div>
        <div {...styles.div}>{DIV}</div>
        <div {...css(styles.edge, styles.right)}>{right}</div>
      </div>
    );
  }
};
