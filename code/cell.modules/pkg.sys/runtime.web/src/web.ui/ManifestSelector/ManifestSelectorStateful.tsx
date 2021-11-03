import React, { useRef } from 'react';

import { CssValue, t, rx, slug } from './common';
import { ManifestSelector } from './ManifestSelector';
import { useStateController } from './hooks';

export type ManifestSelectorStatefulProps = {
  bus: t.EventBus<any>;
  canDrop?: boolean;
  style?: CssValue;
  onEntryClick?: t.ManifestSelectorEntryClickHandler;
};

export const ManifestSelectorStateful: React.FC<ManifestSelectorStatefulProps> = (props) => {
  const id = useRef(slug());
  const bus = rx.busAsType<t.ManifestSelectorEvent>(props.bus);
  const state = useStateController({ bus, component: id.current });

  return (
    <ManifestSelector
      manifestUrl={state.manifestUrl}
      manifest={state.manifest}
      error={state.error}
      canDrop={props.canDrop}
      style={props.style}
      /**
       * Input.
       */
      onManifestUrlChange={(e) => (state.manifestUrl = e.url)}
      onError={(e) => (state.error = e.error)}
      /**
       * Actions.
       */
      onLoadManifest={(e) => {
        const component = id.current;
        const manifest = e.url;
        bus.fire({
          type: 'sys.runtime.web/ManifestSelector/action',
          payload: { kind: 'loadManifest', manifest, component },
        });
      }}
      onEntryClick={(e) => {
        const component = id.current;
        const { manifest } = e;
        bus.fire({
          type: 'sys.runtime.web/ManifestSelector/action',
          payload: { kind: 'loadEntry', manifest, component },
        });
        props.onEntryClick?.(e);
      }}
    />
  );
};
