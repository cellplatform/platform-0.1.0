import React from 'react';

import { CssValue } from './common';
import { ManifestSelector, RemoteEntryClickHandler } from './ManifestSelector';
import { useStateController } from './useStateController';

export type ManifestSelectorStatefulProps = {
  style?: CssValue;
  onRemoteEntryClick?: RemoteEntryClickHandler;
};

export const ManifestSelectorStateful: React.FC<ManifestSelectorStatefulProps> = (props) => {
  const state = useStateController();
  return (
    <ManifestSelector
      manifestUrl={state.url.manifest}
      manifest={state.manifest}
      error={state.error}
      style={props.style}
      onRemoteEntryClick={props.onRemoteEntryClick}
      onLoadManifest={() => state.loadManifest()}
      onManifestUrlChange={(e) => state.setManifestUrl(e.url)}
    />
  );
};
