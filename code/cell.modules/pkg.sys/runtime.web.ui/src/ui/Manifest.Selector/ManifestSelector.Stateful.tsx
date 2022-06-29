import React, { useRef, useEffect } from 'react';

import { CssValue, t, rx, slug, DEFAULT, FC } from './common';
import { ManifestSelector, ManifestSelectorProps } from './ManifestSelector';
import { useStateController, useHistoryController } from './hooks';

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
  autoLoadLatest?: boolean; // The last loaded URL.
  spacing?: ManifestSelectorProps['spacing'];
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
  const history = useHistoryController({ bus, component, ...wrangleHistory(props.history) });

  /**
   * Handlers
   */

  const Fire = {
    loadManifest: (url: string) => Fire.action('load:manifest', url),
    loadEntry: (url: string) => Fire.action('load:entry', url),

    action(kind: t.ManifestSelectorAction['kind'], url: string) {
      const component = id.current;
      bus.fire({
        type: 'sys.runtime.web/ManifestSelector/action',
        payload: { kind, url, component },
      });
    },
  };

  /**
   * Lifecycle
   */
  useEffect(() => {
    if (history.ready && props.autoLoadLatest && history.list.length > 0) {
      //
      const latest = history.list[history.list.length - 1];
      const url = latest?.url;
      if (latest.url) Fire.loadManifest(url);
      // if (latest) {
      //   console.log('latest', latest);
      // }
      // console.log('list', list);
    }
    //
  }, [history.ready]); // eslint-disable-line

  /**
   * Render
   */
  return (
    <ManifestSelector
      manifestUrl={state.manifestUrl}
      manifest={state.manifest}
      error={state.error}
      canDrop={props.canDrop}
      showExports={props.showExports}
      focusOnLoad={props.focusOnLoad}
      fields={props.fields}
      spacing={props.spacing}
      style={props.style}
      /**
       * Input.
       */
      onManifestUrlChange={(e) => (state.manifestUrl = e.url)}
      onError={(e) => (state.error = e.error)}
      /**
       * Actions.
       */
      onLoadManifest={(e) => Fire.loadManifest(e.url)}
      onExportClick={(e) => {
        Fire.loadEntry(e.url);
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
  DEFAULT: typeof DEFAULT;
};
export const ManifestSelectorStateful = FC.decorate<ManifestSelectorStatefulProps, Fields>(
  View,
  { DEFAULT },
  { displayName: 'ManifestSelector.Stateful' },
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
