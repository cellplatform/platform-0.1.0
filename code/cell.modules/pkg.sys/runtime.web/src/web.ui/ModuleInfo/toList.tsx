import Filesize from 'filesize';
import React from 'react';

import { COLORS, color, css, t, time, value, Button, ManifestUrl } from '../../common';
import { Icons } from '../Icons';
import * as m from './types';

export function toList(args: {
  url?: string;
  manifest?: t.ModuleManifest;
  fields?: m.ModuleInfoFields[];
  onExportClick?: m.ModuleInfoExportClick;
}): t.PropListItem[] {
  const { manifest, onExportClick } = args;
  const url = ManifestUrl.parse(args.url ?? '');

  if (!manifest) return [];
  const module = manifest.module;
  const namespace = module.namespace;

  const elapsed = time.duration(time.now.timestamp - module.compiledAt);
  const total = manifest.files.length;
  const noFiles = total === 0;
  const bytes = manifest.files.reduce((acc, next) => acc + next.bytes, 0);
  const filesize = bytes === 0 ? '' : Filesize(bytes);
  const files = `${total} ${value.plural(total, 'file', 'files')}`;

  const trimHashPrefix = (hash: string) => hash.replace(/^sha256-/, '');
  const included = (field: m.ModuleInfoFields) => isIncluded(field, args.fields);

  /**
   * Base properties.
   */
  const list: t.PropListItem[] = [
    {
      label: 'namespace',
      value: { data: module.namespace, clipboard: true },
      visible: included('namespace'),
    },
    {
      label: 'version',
      value: {
        data: `${module.version}`,
        clipboard: `Version: ${module.version}\nModule Hash:\n${manifest.hash.module}`,
      },
      tooltip: `Module Hash (SHA256):\n${trimHashPrefix(manifest.hash.module)}`,
      visible: included('version'),
    },
    {
      label: 'compiled',
      value: {
        data: `${elapsed.toString()} ago`,
        clipboard: `Compilation: ${module.compiler} (${elapsed.toString()} ago)`,
      },
      tooltip: module.compiler,
      visible: included('compiled'),
    },
    {
      label: 'kind',
      value: `${module.target}, ${module.mode}`,
      visible: included('kind'),
    },
    {
      label: 'files',
      value: {
        data: noFiles ? 'none' : `${filesize} (${files})`.trim(),
        clipboard: () => {
          if (noFiles) return 'No files.';
          const lines = manifest.files.map((file) => `- ${file.path} (${Filesize(file.bytes)})`);
          let msg = `${files} (${filesize})`;
          msg = `${msg}\nHash: ${manifest.hash.files}\n\n`;
          msg = `${msg}${lines.join('\n')}`;
          msg = `${msg}\n`;
          return msg;
        },
      },
      tooltip: noFiles ? undefined : `Files Hash (SHA256):\n${trimHashPrefix(manifest.hash.files)}`,
      visible: included('files'),
    },
  ];

  /**
   * Exports.
   */
  const remoteExports = module.remote?.exports || [];
  const hasExports = remoteExports.length > 0;

  if (hasExports && included('remote')) {
    const total = remoteExports.length;
    const plural = value.plural(total, 'export', 'exports');
    list.push({
      label: 'remote',
      value: noFiles ? 'none' : `${total} ${plural}`,
    });
  }

  if (hasExports && included('remote.exports')) {
    const height = 14;
    const styles = {
      label: css({ Flex: 'horizontal-center-center', paddingLeft: 8, height }),
      prefix: css({
        marginLeft: 6,
        fontSize: 9,
        fontWeight: 600,
        PaddingX: 4,
        paddingTop: 2,
        paddingBottom: 1,
        backgroundColor: color.alpha(COLORS.DARK, 0.08),
        border: `solid 1px ${color.format(-0.06)}`,
        borderRadius: 2,
      }),
    };

    const items = remoteExports.map((item) => {
      const entry = item.path;
      const path = parseExportPath(entry);
      const manifestUrl = ManifestUrl.params(url, { entry: item.path }).href;

      const onClick = () => {
        onExportClick?.({ url: manifestUrl, entry, manifest });
      };

      const label = (
        <div {...styles.label} key={`label:${item.path}`}>
          <Icons.Extension size={height} />
          {path.prefix && <div {...styles.prefix}>{path.prefix}</div>}
        </div>
      );

      const value = <Button onClick={onClick}>{path.display}</Button>;

      const res: t.PropListItem = { label, value };
      return res;
    });

    list.push(...items);
  }

  return list;
}

/**
 * [Helpers]
 */

function isIncluded(field: m.ModuleInfoFields, fields?: m.ModuleInfoFields[]) {
  if (fields === undefined) return true;
  return fields.includes(field);
}

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
