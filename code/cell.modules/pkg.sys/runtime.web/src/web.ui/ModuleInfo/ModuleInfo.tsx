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
  const bytes = manifest.files.reduce((acc, next) => acc + next.bytes, 0);
  const filesize = bytes === 0 ? '' : Filesize(bytes);
  const files = `${total} ${value.plural(total, 'file', 'files')}`;

  const list: PropListItem[] = [
    { label: 'namespace', value: module.namespace },
    {
      label: 'version',
      value: module.version,
      tooltip: `module hash: ${manifest.hash.module}`,
    },
    {
      label: 'compiled',
      value: `${elapsed.toString()} ago`,
      tooltip: module.compiler,
    },
    { label: 'kind', value: `${module.target}, ${module.mode}` },
    { label: 'files', value: total === 0 ? 'none' : `${filesize} (${files})`.trim() },
  ];

  if (module.remote?.exports.length || 0 > 0) {
    const total = module.remote?.exports.length || 0;
    const plural = value.plural(total, 'export', 'exports');
    list.push({ label: 'remote', value: total === 0 ? 'none' : `${total} ${plural}` });
  }

  return list;
}
