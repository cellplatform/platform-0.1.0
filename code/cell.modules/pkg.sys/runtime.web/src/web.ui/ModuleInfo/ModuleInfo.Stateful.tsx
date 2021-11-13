import React from 'react';

import { CssValue, t } from '../../common';
import { useManifest } from '../useManifest';
import { ModuleInfo } from './ModuleInfo';
import * as m from './types';

export type ModuleInfoStatefulProps = {
  title?: m.ModuleInfoTitle;
  url?: t.ManifestUrl;
  fields?: m.ModuleInfoFields[];
  minWidth?: number;
  maxWidth?: number;
  style?: CssValue;
};

export const ModuleInfoStateful: React.FC<ModuleInfoStatefulProps> = (props) => {
  const { url, title, fields, minWidth, maxWidth, style } = props;
  const manifest = useManifest({ url });
  return (
    <ModuleInfo
      title={title}
      manifest={manifest.json}
      fields={fields}
      minWidth={minWidth}
      maxWidth={maxWidth}
      style={style}
    />
  );
};
