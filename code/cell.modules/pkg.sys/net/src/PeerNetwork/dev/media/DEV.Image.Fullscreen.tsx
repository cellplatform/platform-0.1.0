import React, { useEffect, useRef, useState } from 'react';
import { StringUtil, color, css, CssValue, t, FileUtil, PropList, PropListItem } from '../common';
import { DevModal } from '../DEV.Modal';

export type DevImageFullscreenProps = {
  bus: t.EventBus<any>;
  file: t.PeerFile;
  uri: string;
  style?: CssValue;
};

export const DevImageFullscreen: React.FC<DevImageFullscreenProps> = (props) => {
  const { bus, file, uri } = props;

  const styles = {
    base: css({
      flex: 1,
      position: 'relative',
      backgroundColor: color.format(1),
    }),
    image: css({
      Absolute: 20,
      backgroundSize: 'cover',
      backgroundImage: `url(${uri})`,
      backgroundPosition: 'center center',
    }),
    props: {
      base: css({
        Absolute: [null, null, 10, 10],
        backgroundColor: color.format(0.65),
        backdropFilter: `blur(5px)`,
        borderRadius: 5,
        padding: 12,
        paddingRight: 18,
        minWidth: 250,
      }),
      hash: css({ fontSize: 11 }),
    },
  };

  const hash = {
    truncated: StringUtil.truncate(file.hash.replace(/^sha256-/, '')),
  };

  const items: (PropListItem | undefined)[] = [
    { label: 'filename', value: file.filename },
    file.dir ? { label: 'dir', value: file.dir } : undefined,
    { label: 'size', value: FileUtil.filesize(file.blob).toString() },
    {
      label: 'hash (sha256)',
      value: { data: hash.truncated, clipboard: file.hash },
    },
  ].filter(Boolean);

  return (
    <div {...css(styles.base, props.style)}>
      <DevModal bus={bus}>
        <div {...styles.image} />
        <div {...styles.props.base}>
          <PropList items={items} />
        </div>
      </DevModal>
    </div>
  );
};
