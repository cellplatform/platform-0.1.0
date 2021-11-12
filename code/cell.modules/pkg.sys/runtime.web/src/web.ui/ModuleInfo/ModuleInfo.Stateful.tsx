import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t } from '../../common';
import { useManifest } from '../hooks';
import { ModuleInfo } from './ModuleInfo';

type ManifestUrl = string;

export type ModuleInfoStatefulProps = {
  title?: string | React.ReactNode | null;
  url?: ManifestUrl;
  style?: CssValue;
};

export const ModuleInfoStateful: React.FC<ModuleInfoStatefulProps> = (props) => {
  const { url, title, style } = props;
  const manifest = useManifest({ url });
  return <ModuleInfo title={title} manifest={manifest.json} style={style} />;
};
