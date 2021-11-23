import React from 'react';

import { CssValue, t } from '../../common';
import { useManifest } from '../useManifest';
import { ModuleInfo } from './ModuleInfo';
import * as m from './types';

export type ModuleInfoStatefulProps = {
  url?: t.ManifestUrl;
  title?: m.ModuleInfoTitle;
  fields?: m.ModuleInfoField[];
  minWidth?: number;
  maxWidth?: number;
  style?: CssValue;
  onExportClick?: m.ModuleInfoExportClick;
};

export const ModuleInfoStateful: React.FC<ModuleInfoStatefulProps> = (props) => {
  const { url, title, fields, minWidth, maxWidth, style, onExportClick } = props;
  const manifest = useManifest({ url });

  return (
    <ModuleInfo
      title={title}
      manifestUrl={manifest.url.href}
      manifest={manifest.json}
      fields={fields}
      minWidth={minWidth}
      maxWidth={maxWidth}
      style={style}
      onExportClick={onExportClick}
    />
  );
};
