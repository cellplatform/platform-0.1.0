import Filesize from 'filesize';
import React from 'react';
import { PropList, PropListItem } from 'sys.ui.primitives/lib/ui/PropList';

import { color, css, CssValue, t, time, value } from '../../common';
import * as m from './types';

export type ModuleInfoProps = {
  title?: m.ModuleInfoTitle;
  manifest?: t.ModuleManifest;
  fields?: m.ModuleInfoFields[];
  style?: CssValue;
};

export const ModuleInfo: React.FC<ModuleInfoProps> = (props) => {
  const { manifest, fields } = props;
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

  const items: PropListItem[] = toList({ manifest, fields });
  const elEmpty = !manifest && <div {...styles.empty}>Module not loaded.</div>;
  const elProps = !elEmpty && (
    <PropList title={title} items={items} defaults={{ clipboard: false }} />
  );

  return (
    <div {...css(styles.base, props.style)}>
      {elProps}
      {elEmpty}
    </div>
  );
};

/**
 * [Helpers]
 */

function toList(args: {
  manifest?: t.ModuleManifest;
  fields?: m.ModuleInfoFields[];
}): PropListItem[] {
  const { manifest } = args;
  if (!manifest) return [];
  const module = manifest.module;

  const elapsed = time.duration(time.now.timestamp - module.compiledAt);
  const total = manifest.files.length;
  const noFiles = total === 0;
  const bytes = manifest.files.reduce((acc, next) => acc + next.bytes, 0);
  const filesize = bytes === 0 ? '' : Filesize(bytes);
  const files = `${total} ${value.plural(total, 'file', 'files')}`;

  const trimHashPrefix = (hash: string) => hash.replace(/^sha256-/, '');
  const included = (field: m.ModuleInfoFields) => isIncluded(field, args.fields);

  const list: PropListItem[] = [
    { label: 'namespace', value: module.namespace, visible: included('namespace') },
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
      value: `${elapsed.toString()} ago`,
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

  if ((included('remote') && module.remote?.exports.length) || 0 > 0) {
    const total = module.remote?.exports.length || 0;
    const plural = value.plural(total, 'export', 'exports');
    list.push({
      label: 'remote',
      value: noFiles ? 'none' : `${total} ${plural}`,
    });
  }

  return list;
}

function isIncluded(field: m.ModuleInfoFields, fields?: m.ModuleInfoFields[]) {
  if (fields === undefined) return true;
  return fields.includes(field);
}
