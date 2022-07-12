import Filesize from 'filesize';
import React from 'react';

import { css, t, value } from '../common';
import { trimHashPrefix } from './util';

type P = t.PropListItem;

export function toFiles(args: { manifest: t.ModuleManifest }) {
  const { manifest } = args;

  const total = manifest.files.length;
  const noFiles = total === 0;
  const bytes = manifest.files.reduce((acc, next) => acc + next.bytes, 0);

  const item: P = {
    label: 'files',
    value: {
      data: noFiles ? 'none' : <FilesLabel total={total} bytes={bytes} />,
      clipboard: () => {
        if (noFiles) return 'No files.';
        const { files, filesize } = Util.toTextValues({ bytes, total });
        const lines = manifest.files.map((file) => `- ${file.path} (${Filesize(file.bytes)})`);
        let msg = `${files} (${filesize})`;
        msg = `${msg}\nHash: ${manifest.hash.files}\n\n`;
        msg = `${msg}${lines.join('\n')}`;
        msg = `${msg}\n`;
        return msg;
      },
    },
    tooltip: noFiles ? undefined : `Files Hash (SHA256):\n${trimHashPrefix(manifest.hash.files)}`,
  };

  return item;
}

/**
 * Helpers
 */

export type FilesLabelProps = { total: number; bytes: number };
export const FilesLabel: React.FC<FilesLabelProps> = (props) => {
  const { files, filesize } = Util.toTextValues(props);

  /**
   * [Render]
   */
  const styles = {
    base: css({ Flex: 'x-center-center' }),
    total: css({ opacity: 0.3, marginRight: 7 }),
    filesize: css({}),
  };
  return (
    <div {...css(styles.base)}>
      <div {...styles.total}>{`(${files})`}</div>
      <div {...styles.filesize}>{filesize}</div>
    </div>
  );
};

const Util = {
  toTextValues(args: { total: number; bytes: number }) {
    const { bytes, total } = args;
    const files = `${total} ${value.plural(total, 'file', 'files')}`;
    const filesize = bytes === 0 ? '' : Filesize(bytes);
    return { total, bytes, files, filesize };
  },
};
