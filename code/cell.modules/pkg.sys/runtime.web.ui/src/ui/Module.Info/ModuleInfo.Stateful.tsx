import React from 'react';

import { CssValue, t } from './common';
import { useManifest } from '../useManifest';
import { ModuleInfo } from './ModuleInfo';

export type ModuleInfoStatefulProps = {
  url?: t.ManifestUrl;
  title?: t.ModuleInfoTitle;
  fields?: t.ModuleInfoFields[];
  empty?: string | JSX.Element | null;
  minWidth?: number;
  maxWidth?: number;
  style?: CssValue;
  onExportClick?: t.ModuleInfoExportClick;
  onLoaded?: t.ManifestHookLoadedHandler;
};

export const ModuleInfoStateful: React.FC<ModuleInfoStatefulProps> = (props) => {
  const { url, onExportClick, onLoaded } = props;
  const manifest = useManifest({ url, onLoaded });

  return (
    <ModuleInfo
      title={props.title}
      url={manifest.url}
      manifest={manifest.json}
      fields={props.fields}
      minWidth={props.minWidth}
      maxWidth={props.maxWidth}
      empty={props.empty}
      style={props.style}
      onExportClick={onExportClick}
    />
  );
};
