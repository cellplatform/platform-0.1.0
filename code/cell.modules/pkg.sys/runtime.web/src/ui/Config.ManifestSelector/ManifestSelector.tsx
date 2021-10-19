import React from 'react';

import { color, css, CssValue, t, useDragTarget, COLORS } from './common';
import { List } from './components/List';
import { UrlTextbox } from './components/UrlTextbox';
import { Info } from './components/Info';
import { LoadManifestHandler, ManifestUrlChangeHandler, RemoteEntryClickHandler } from './types';

type Url = string;

export { RemoteEntryClickHandler };
export type ManifestSelectorProps = {
  manifestUrl?: Url;
  manifest?: t.ModuleManifest;
  error?: string;
  canDrop?: boolean;
  style?: CssValue;
  onManifestUrlChange?: ManifestUrlChangeHandler;
  onLoadManifest?: LoadManifestHandler;
  onRemoteEntryClick?: RemoteEntryClickHandler;
  onError?: (e: { error: string }) => void;
};

export const ManifestSelector: React.FC<ManifestSelectorProps> = (props) => {
  const { manifest } = props;
  const remote = manifest?.module?.remote;
  const manifestUrl = (props.manifestUrl ?? '').trim();

  const drag = useDragTarget<HTMLDivElement>({
    isEnabled: props.canDrop ?? true,
    onDrop: (e) => {
      const url = (e.urls[0] ?? '').trim();
      if (url) {
        props.onLoadManifest?.({ url });
      } else {
        const error = `Dropped file is not a link (URL).`;
        props.onError?.({ error });
      }
    },
  });

  /**
   * [Render]
   */

  const styles = {
    base: css({
      flex: 1,
      position: 'relative',
      color: COLORS.DARK,
    }),
    body: {
      base: css({
        Flex: 'horizontal-stretch-stretch',
        paddingTop: 8,
      }),
      info: css({ marginRight: 12 }),
      list: css({ flex: 1 }),
    },
    drag: {
      base: css({ Absolute: 0, Flex: 'center-center' }),
      body: css({
        backgroundColor: color.format(0.7),
        backdropFilter: `blur(8px)`,
        border: `dashed 1px ${color.format(-0.3)}`,
        borderRadius: 6,
        PaddingX: 20,
        PaddingY: 6,
      }),
    },
  };

  const elUrlTextbox = (
    <UrlTextbox
      url={manifestUrl}
      error={props.error}
      onChange={props.onManifestUrlChange}
      onLoadManifest={props.onLoadManifest}
    />
  );

  const elBody = remote && (
    <div {...styles.body.base}>
      <Info manifestUrl={manifestUrl} manifest={manifest} style={styles.body.info} />
      <List
        manifest={manifest}
        manifestUrl={manifestUrl}
        onRemoteEntryClick={props.onRemoteEntryClick}
        style={styles.body.list}
      />
    </div>
  );

  const elDragOverlay = drag.isDragOver && (
    <div {...styles.drag.base}>
      <div {...styles.drag.body}>Drop Browser Link</div>
    </div>
  );

  return (
    <div {...css(styles.base, props.style)} ref={drag.ref}>
      {elUrlTextbox}
      {elBody}
      {elDragOverlay}
    </div>
  );
};
