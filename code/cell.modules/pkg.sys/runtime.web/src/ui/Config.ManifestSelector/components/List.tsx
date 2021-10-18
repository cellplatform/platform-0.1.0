import React from 'react';

import { Icons } from '../../Icons';
import { Button, css, CssValue, Parse, t } from '../common';
import { RemoteEntryClickHandler } from '../types';

type Url = string;

export type ManifestSelectorListProps = {
  manifestUrl: Url;
  manifest: t.ModuleManifest;
  style?: CssValue;
  onRemoteEntryClick?: RemoteEntryClickHandler;
};

export const ManifestSelectorList: React.FC<ManifestSelectorListProps> = (props) => {
  const { manifest } = props;
  const remote = manifest?.module?.remote;
  if (!remote) return null;

  const namespace = manifest?.module?.namespace ?? '';
  const manifestUrl = props.manifestUrl.trim();
  const url = {
    manifest: manifestUrl,
    remoteEntry: Parse.remoteEntryUrl(manifestUrl, manifest),
  };

  const onRemoteEntryClick = (item: t.ModuleManifestRemoteExport) => {
    const entry = item.path;
    const remote = { url: url.remoteEntry, namespace, entry };
    props.onRemoteEntryClick?.({ manifest: url.manifest, remote });
  };

  /**
   * Render
   */
  const styles = {
    base: css({}),
    list: {
      base: css({ MarginX: 20, marginTop: 8 }),
      item: css({ Flex: 'horizontal-stretch-center', fontSize: 12, marginBottom: 3 }),
      icon: css({ marginRight: 6 }),
    },
  };

  return (
    <div {...css(styles.base, props.style)}>
      <div {...styles.list.base}>
        {remote.exports.map((item, i) => {
          const path = item.path.replace(/^\./, '').replace(/^\/*/, '');
          return (
            <div key={i} {...styles.list.item}>
              <Icons.Extension style={styles.list.icon} />
              <Button onClick={() => onRemoteEntryClick(item)}>{path}</Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
