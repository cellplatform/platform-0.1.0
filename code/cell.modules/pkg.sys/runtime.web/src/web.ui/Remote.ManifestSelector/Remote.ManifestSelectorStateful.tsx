import React from 'react';

import { CssValue } from './common';
import { RemoteManifestSelector, RemoteEntryClickHandler } from './Remote.ManifestSelector';
import { useStateController } from './hooks';

export type RemoteManifestSelectorStatefulProps = {
  canDrop?: boolean;
  style?: CssValue;
  onRemoteEntryClick?: RemoteEntryClickHandler;
};

export const RemoteManifestSelectorStateful: React.FC<RemoteManifestSelectorStatefulProps> = (
  props,
) => {
  const state = useStateController();
  return (
    <RemoteManifestSelector
      manifestUrl={state.manifestUrl}
      manifest={state.manifest}
      error={state.error}
      canDrop={props.canDrop}
      style={props.style}
      onRemoteEntryClick={props.onRemoteEntryClick}
      onLoadManifest={(e) => state.loadManifest(e.url)}
      onManifestUrlChange={(e) => (state.manifestUrl = e.url)}
      onError={(e) => (state.error = e.error)}
    />
  );
};
