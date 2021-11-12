import React, { useEffect, useRef, useState } from 'react';
import { color, css, CssValue, t, time, value } from '../../common';

import { PropList, PropListProps, PropListItem } from 'sys.ui.primitives/lib/ui/PropList';
import Filesize from 'filesize';

export type ModuleInfoProps = {
  title?: string | React.ReactNode | null;
  manifest?: t.ModuleManifest;
  style?: CssValue;
};

export const ModuleInfo: React.FC<ModuleInfoProps> = (props) => {
  const { manifest } = props;
  const title = props.title ? props.title : props.title === null ? '' : 'Module';

  const styles = {
    base: css({
      position: 'relative',
      minWidth: 200,
    }),
    empty: css({
      color: color.format(-0.3),
      fontStyle: 'italic',
      fontSize: 12,
      textAlign: 'center',
      PaddingY: 6,
    }),
  };

  const items: PropListItem[] = toList(manifest);
  const elEmpty = !manifest && <div {...styles.empty}>Module not loaded.</div>;

  return (
    <div {...css(styles.base, props.style)}>
      <PropList title={title} items={items} defaults={{ clipboard: false }} />
      {elEmpty}
    </div>
  );
};

/**
 * [Helpers]
 */

function toList(manifest?: t.ModuleManifest): PropListItem[] {
  if (!manifest) return [];
  const module = manifest.module;

  const elapsed = time.duration(time.now.timestamp - module.compiledAt);
  const total = manifest.files.length;
  const noFiles = total === 0;
  const bytes = manifest.files.reduce((acc, next) => acc + next.bytes, 0);
  const filesize = bytes === 0 ? '' : Filesize(bytes);
  const files = `${total} ${value.plural(total, 'file', 'files')}`;

  const trimHashPrefix = (hash: string) => hash.replace(/^sha256-/, '');

  const list: PropListItem[] = [
    { label: 'namespace', value: module.namespace },
    {
      label: 'version',
      value: {
        data: `${module.version}`,
        clipboard: `Version: ${module.version}\nModule Hash:\n${manifest.hash.module}`,
      },
      tooltip: `Module Hash (SHA256):\n${trimHashPrefix(manifest.hash.module)}`,
    },
    {
      label: 'compiled',
      value: `${elapsed.toString()} ago`,
      tooltip: module.compiler,
    },
    { label: 'kind', value: `${module.target}, ${module.mode}` },
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
    },
  ];

  if (module.remote?.exports.length || 0 > 0) {
    const total = module.remote?.exports.length || 0;
    const plural = value.plural(total, 'export', 'exports');
    list.push({ label: 'remote', value: noFiles ? 'none' : `${total} ${plural}` });
  }

  return list;
}
