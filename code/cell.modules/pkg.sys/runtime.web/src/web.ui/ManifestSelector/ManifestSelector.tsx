import React from 'react';

import { color, css, CssValue, t, useDragTarget, COLORS, ManifestUrl } from './common';
import { UrlTextbox } from './components/UrlTextbox';
import { ModuleInfo } from '../ModuleInfo';
import { ModuleInfoField } from '../ModuleInfo/types';

export type ManifestSelectorProps = {
  manifestUrl?: t.ManifestUrl;
  manifest?: t.ModuleManifest;
  error?: string;
  canDrop?: boolean;
  showExports?: boolean;
  focusOnLoad?: boolean;
  fields?: ModuleInfoField[];
  style?: CssValue;
  onManifestUrlChange?: t.ManifestSelectorUrlChangeHandler;
  onLoadManifest?: t.ManifestSelectorLoadHandler;
  onExportClick?: t.ManifestSelectorExportClickHandler;
  onError?: (e: { error: string }) => void;
  onKeyUp?: t.ManifestSelectorKeyboardHandler;
  onKeyDown?: t.ManifestSelectorKeyboardHandler;
};

export const ManifestSelector: React.FC<ManifestSelectorProps> = (props) => {
  const { manifest, showExports = true } = props;
  const remote = manifest?.module?.remote;
  const manifestUrl = (props.manifestUrl ?? '').trim();
  const fields = props.fields ?? [
    'source:url:hash',
    'namespace',
    'version',
    'compiled',
    'files',
    'remote.exports',
  ];

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
    base: css({ flex: 1, position: 'relative', color: COLORS.DARK, boxSizing: 'border-box' }),
    body: {
      base: css({ paddingTop: 8 }),
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
      focusOnLoad={props.focusOnLoad}
      onChange={props.onManifestUrlChange}
      onLoadManifest={props.onLoadManifest}
      onKeyDown={props.onKeyDown}
      onKeyUp={props.onKeyUp}
    />
  );

  const elBody = remote && showExports && (
    <div {...styles.body.base}>
      <ModuleInfo
        title={null}
        manifestUrl={manifestUrl}
        manifest={manifest}
        fields={fields}
        onExportClick={(e) => {
          const { url, entry } = e;
          const module = ManifestUrl.toRemoteImport(manifestUrl, manifest, entry);
          props.onExportClick?.({ url, module });
        }}
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
