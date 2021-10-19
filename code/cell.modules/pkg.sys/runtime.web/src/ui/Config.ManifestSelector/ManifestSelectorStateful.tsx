import React from 'react';

import { CssValue } from './common';
import { ManifestSelector, RemoteEntryClickHandler } from './ManifestSelector';
import { useStateController } from './useStateController';

export type ManifestSelectorStatefulProps = {
  canDrop?: boolean;
  style?: CssValue;
  onRemoteEntryClick?: RemoteEntryClickHandler;
};

export const ManifestSelectorStateful: React.FC<ManifestSelectorStatefulProps> = (props) => {
  const state = useStateController();
  return (
    <ManifestSelector
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
