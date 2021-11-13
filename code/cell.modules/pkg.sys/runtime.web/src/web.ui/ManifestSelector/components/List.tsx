import React, { useState } from 'react';

import { Icons } from '../../Icons';
import { Button, css, CssValue, Parse, t, COLORS } from '../common';
import { ManifestSelectorEntryClickHandler } from '../types';

type Url = string;

export type ListProps = {
  manifestUrl: t.ManifestUrl;
  manifest: t.ModuleManifest;
  style?: CssValue;
  onRemoteEntryClick?: ManifestSelectorEntryClickHandler;
};

export const List: React.FC<ListProps> = (props) => {
  const { manifest } = props;
  const remote = manifest?.module?.remote;

  const namespace = manifest?.module?.namespace ?? '';
  const manifestUrl = props.manifestUrl.trim();
  const url = {
    manifest: manifestUrl,
    remoteEntry: Parse.remoteEntryUrl(manifestUrl, manifest),
  };

  const [overItem, setOverItem] = useState(-1);

  const onRemoteEntryClick = (item: t.ModuleManifestRemoteExport) => {
    const entry = item.path;
    const remote = { url: url.remoteEntry, namespace, entry };
    props.onRemoteEntryClick?.({ url: url.manifest, remote });
  };

  /**
   * Render
   */
  if (!remote) return null;

  const styles = {
    base: css({}),
    list: {
      item: css({ Flex: 'horizontal-stretch-center', fontSize: 12, MarginY: 3 }),
      icon: css({ marginRight: 6 }),
    },
  };

  return (
    <div {...css(styles.base, props.style)}>
      {remote.exports.map((item, i) => {
        const path = item.path.replace(/^\./, '').replace(/^\/*/, '');
        const isOver = overItem === i;
        const iconColor = isOver ? COLORS.BLUE : COLORS.DARK;
        const iconOpacity = isOver ? 1 : 0.6;
        return (
          <Button
            key={i}
            onClick={() => onRemoteEntryClick(item)}
            block={true}
            onMouseEnter={() => setOverItem(i)}
            onMouseLeave={() => setOverItem(-1)}
          >
            <div {...styles.list.item}>
              <Icons.Extension
                style={styles.list.icon}
                color={iconColor}
                opacity={iconOpacity}
                size={18}
              />
              <div>{path}</div>
            </div>
          </Button>
        );
      })}
    </div>
  );
};
