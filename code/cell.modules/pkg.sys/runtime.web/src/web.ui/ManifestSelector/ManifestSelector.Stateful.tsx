import React, { useRef } from 'react';

import { CssValue, t, rx, slug } from './common';
import { ManifestSelector } from './ManifestSelector';
import { useStateController } from './hooks';
import { ModuleInfoFields } from '../ModuleInfo/types';

export type ManifestSelectorStatefulProps = {
  bus: t.EventBus<any>;
  canDrop?: boolean;
  showExports?: boolean;
  fields?: ModuleInfoFields[];
  style?: CssValue;
  onExportClick?: t.ManifestSelectorExportClickHandler;
  onChanged?: t.ManifestSelectorChangedHandler;
};

export const ManifestSelectorStateful: React.FC<ManifestSelectorStatefulProps> = (props) => {
  const { onChanged } = props;
  const id = useRef(slug());
  const bus = rx.busAsType<t.ManifestSelectorEvent>(props.bus);
  const component = id.current;
  const state = useStateController({ bus, component, onChanged });

  return (
    <ManifestSelector
      manifestUrl={state.manifestUrl}
      manifest={state.manifest}
      error={state.error}
      canDrop={props.canDrop}
      showExports={props.showExports}
      fields={props.fields}
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
        const url = e.url;
        bus.fire({
          type: 'sys.runtime.web/ManifestSelector/action',
          payload: { kind: 'loadManifest', url, component },
        });
      }}
      onExportClick={(e) => {
        const component = id.current;
        const { url } = e;
        bus.fire({
          type: 'sys.runtime.web/ManifestSelector/action',
          payload: { kind: 'loadEntry', url, component },
        });
        props.onExportClick?.(e);
      }}
    />
  );
};
