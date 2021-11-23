import React from 'react';

import { Button, ManifestUrl, t, value } from '../../common';
import { ExportLabel } from '../components/ExportLabel';
import * as m from '../types';

type P = t.PropListItem;

export function toRemote(args: {
  manifest: t.ModuleManifest;
  url: t.ManifestUrlParts;
  onExportClick?: m.ModuleInfoExportClick;
}) {
  const { manifest, onExportClick } = args;
  const noFiles = manifest.files.length === 0;
  const remoteExports = manifest.module.remote?.exports || [];
  const hasExports = remoteExports.length > 0;

  const total = remoteExports.length;
  const plural = value.plural(total, 'export', 'exports');
  const item: P = {
    label: 'api',
    value: noFiles ? 'none' : `${total} ${plural}`,
  };

  /**
   * List
   */
  const exports = remoteExports.map((item) => {
    const entry = item.path;
    const path = parseExportPath(entry);
    const onClick = () => {
      const url = ManifestUrl.params(args.url, { entry }).href;
      onExportClick?.({ url, entry, manifest });
    };
    const label = <ExportLabel key={`label:${item.path}`} text={path.prefix} />;
    const value = <Button onClick={onClick}>{path.display}</Button>;
    const res: P = { label, value };
    return res;
  });

  return { hasExports, item, exports };
}

/**
 * [Helpers]
 */

function parseExportPath(path: string) {
  let display = path.replace(/^\.\//, '');
  const parts = display.split('/');

  let prefix = '';
  if (parts[0]) {
    const dots = parts[0].split('.');
    if (isUpperCase(dots[0])) {
      prefix = dots[0];
      display = display.substring(prefix.length + 1);
    }
  }

  return {
    prefix,
    display,
    toString: () => path,
  };
}

function isUpperCase(text: string) {
  return text === text.toUpperCase();
}
