import React from 'react';

import { css, CssValue, t } from './common';
import { ManifestSelectorList } from './components/List';
import { ManifestSelectorTextbox } from './components/Textbox';
import { LoadManifestHandler, ManifestUrlChangeHandler, RemoteEntryClickHandler } from './types';

type Url = string;

export { RemoteEntryClickHandler };
export type ManifestSelectorProps = {
  manifestUrl?: Url;
  manifest?: t.ModuleManifest;
  error?: string;
  style?: CssValue;
  onManifestUrlChange?: ManifestUrlChangeHandler;
  onLoadManifest?: LoadManifestHandler;
  onRemoteEntryClick?: RemoteEntryClickHandler;
};

export const ManifestSelector: React.FC<ManifestSelectorProps> = (props) => {
  const { manifest } = props;
  const remote = manifest?.module?.remote;
  const manifestUrl = (props.manifestUrl ?? '').trim();

  /**
   * [Render]
   */

  const styles = {
    base: css({ flex: 1, position: 'relative' }),
  };

  const elUrlTextbox = (
    <ManifestSelectorTextbox
      url={manifestUrl}
      error={props.error}
      onChange={props.onManifestUrlChange}
      onLoadManifest={props.onLoadManifest}
    />
  );

  const elList = remote && (
    <ManifestSelectorList
      manifestUrl={manifestUrl}
      manifest={manifest}
      onRemoteEntryClick={props.onRemoteEntryClick}
    />
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elUrlTextbox}
      {elList}
    </div>
  );
};
