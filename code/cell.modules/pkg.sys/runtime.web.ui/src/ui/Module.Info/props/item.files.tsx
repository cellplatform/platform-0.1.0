import Filesize from 'filesize';

import { t, value } from '../../common';
import { trimHashPrefix } from './util';

type P = t.PropListItem;

export function toFiles(args: { manifest: t.ModuleManifest }) {
  const { manifest } = args;

  const total = manifest.files.length;
  const noFiles = total === 0;
  const bytes = manifest.files.reduce((acc, next) => acc + next.bytes, 0);
  const filesize = bytes === 0 ? '' : Filesize(bytes);
  const files = `${total} ${value.plural(total, 'file', 'files')}`;

  const item: P = {
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
  };

  return item;
}
