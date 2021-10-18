import React from 'react';
import { Textbox } from 'sys.ui.dev/lib/ui/Textbox';

import { Icons } from '../Icons';
import { Button, color, COLORS, css, CssValue, Parse, t } from './common';

type Url = string;

export type RemoteEntryClickHandler = (e: RemoteEntryClickArgs) => void;
export type RemoteEntryClickArgs = { manifest: Url; remote: RemoteEntry };
export type RemoteEntry = {
  url: Url;
  namespace: string;
  entry: string;
};

export type ManifestSelectorProps = {
  manifestUrl?: Url;
  manifest?: t.ModuleManifest;
  error?: string;
  style?: CssValue;
  onManifestUrlChange?: (e: { url: Url }) => void;
  onLoadManifest?: (e: { manifestUrl: Url }) => void;
  onRemoteEntryClick?: RemoteEntryClickHandler;
};

export const ManifestSelector: React.FC<ManifestSelectorProps> = (props) => {
  const { manifest } = props;
  const remote = manifest?.module?.remote;
  const namespace = manifest?.module?.namespace ?? '';
  const manifestUrl = (props.manifestUrl ?? '').trim();
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
   * [Render]
   */

  const styles = {
    base: css({
      flex: 1,
      position: 'relative',
    }),
    url: {
      textbox: css({ fontSize: 12 }),
      error: css({ marginTop: 4, color: COLORS.MAGENTA, fontSize: 11 }),
    },
    list: {
      base: css({
        MarginX: 20,
        marginTop: 8,
      }),
      item: css({
        Flex: 'horizontal-stretch-center',
        fontSize: 12,
        marginBottom: 3,
      }),
      icon: css({ marginRight: 6 }),
    },
  };

  const elUrlError = props.error && <div {...styles.url.error}>{props.error}</div>;

  const elList = remote && (
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
  );

  const elUrlTextbox = (
    <Textbox
      value={manifestUrl}
      placeholder={'manifest url'}
      onChange={(e) => props.onManifestUrlChange?.({ url: e.to })}
      style={styles.url.textbox}
      spellCheck={false}
      selectOnFocus={true}
      enter={{
        isEnabled: Boolean(manifestUrl),
        handler: () => props.onLoadManifest?.({ manifestUrl }),
        icon(e) {
          const url = manifestUrl;
          const el = (
            <div {...css({ Flex: 'horizontal-center-center' })}>
              {url && <Icons.Arrow.Forward size={18} opacity={0.5} style={{ marginRight: 4 }} />}
              <Icons.Antenna size={18} color={url ? COLORS.BLUE : color.alpha(COLORS.DARK, 0.6)} />
            </div>
          );
          return el;
        },
      }}
    />
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elUrlTextbox}
      {elUrlError}
      {elList}
    </div>
  );
};
