import React, { useRef } from 'react';

import { CssValue, t, rx, slug, DEFAULT, FC } from './common';
import { ManifestSelector } from './ManifestSelector';
import { useStateController, useHistoryController } from './hooks';
import { ManifestSelectorConstants as constants } from './constants';

/**
 * Types
 */
type Id = string;
type FilesystemId = string;
type FilePath = string;
type History = { fs: FilesystemId; path: FilePath };

export type ManifestSelectorStatefulProps = {
  instance: { bus: t.EventBus<any>; id?: Id };
  canDrop?: boolean;
  showExports?: boolean;
  fields?: t.ModuleInfoFields[];
  history?: boolean | Partial<History>;
  focusOnLoad?: boolean;
  style?: CssValue;
  onExportClick?: t.ManifestSelectorExportClickHandler;
  onChanged?: t.ManifestSelectorChangedHandler;
};

/**
 * Component
 */
const View: React.FC<ManifestSelectorStatefulProps> = (props) => {
  const { onChanged, instance } = props;
  const id = useRef(instance.id || slug());
  const bus = rx.busAsType<t.ManifestSelectorEvent>(instance.bus);
  const component = id.current;

  const state = useStateController({ bus, component, onChanged });
  useHistoryController({ bus, component, ...wrangleHistory(props.history) });

  return (
    <ManifestSelector
      manifestUrl={state.manifestUrl}
      manifest={state.manifest}
      error={state.error}
      canDrop={props.canDrop}
      showExports={props.showExports}
      focusOnLoad={props.focusOnLoad}
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
          payload: { kind: 'load:manifest', url, component },
        });
      }}
      onExportClick={(e) => {
        const component = id.current;
        const { url } = e;
        bus.fire({
          type: 'sys.runtime.web/ManifestSelector/action',
          payload: { kind: 'load:entry', url, component },
        });
        props.onExportClick?.(e);
      }}
      onKeyDown={(keypress) => {
        const url = state.manifestUrl;
        bus.fire({
          type: 'sys.runtime.web/ManifestSelector/keypress',
          payload: { component, keypress, current: { url } },
        });
      }}
    />
  );
};

/**
 * Export
 */

type Fields = {
  constants: typeof constants;
};
export const ManifestSelectorStateful = FC.decorate<ManifestSelectorStatefulProps, Fields>(
  View,
  { constants },
  { displayName: 'ManifestSelectorStateful' },
);

/**
 * [Helpers]
 */

function wrangleHistory(input?: boolean | Partial<History>) {
  const HISTORY = DEFAULT.HISTORY;
  const res = { enabled: true, fs: HISTORY.FS, path: HISTORY.PATH };
  if (input === false) return { ...res, enabled: false };
  if (input === true || input === undefined) return res;
  return { ...res, fs: input.fs ?? HISTORY.FS, path: input.path ?? HISTORY.PATH };
}
