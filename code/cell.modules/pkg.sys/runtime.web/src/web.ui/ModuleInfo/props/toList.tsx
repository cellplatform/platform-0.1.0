import { ManifestUrl, t, time } from '../../common';
import * as m from '../types';
import { FIELDS } from './DEFAULTS';
import { toFiles } from './item.files';
import { toHash } from './item.hash';
import { toRemote } from './item.remote';
import { toUrl } from './item.url';

type P = t.PropListItem;
export function toPropsList(args: {
  manifest?: t.ModuleManifest;
  url?: string;
  fields?: m.ModuleInfoFields[];
  onExportClick?: m.ModuleInfoExportClick;
}): t.PropListItem[] {
  const { manifest, onExportClick, fields = FIELDS } = args;

  if (!manifest) return [];

  const url = ManifestUrl.parse(args.url ?? '');
  const module = manifest.module;
  const elapsed = time.duration(time.now.timestamp - module.compiledAt);

  /**
   * Base properties.
   */
  const list: P[] = [];
  const add = (field: m.ModuleInfoFields) => {
    if (field === 'url' && args.url) {
      list.push(toUrl({ url }));
    }

    if (field === 'namespace') {
      list.push({
        label: 'namespace',
        value: { data: module.namespace, clipboard: true },
      });
    }

    if (field === 'version') {
      list.push({
        label: 'version',
        value: { data: `${module.version}`, clipboard: module.version },
      });
    }

    if (field === 'hash' || field === 'hash.module' || field === 'hash.files') {
      list.push(toHash({ manifest, field }));
    }

    if (field === 'compiled') {
      const clipboard = `Compilation: ${module.compiler} (${elapsed.toString()} ago)`;
      list.push({
        label: 'compiled',
        value: { data: `${elapsed.toString()} ago`, clipboard },
        tooltip: module.compiler,
      });
    }

    if (field === 'kind') {
      list.push({
        label: 'kind',
        value: `${module.target}, ${module.mode}`,
      });
    }

    if (field === 'files') {
      list.push(toFiles({ manifest }));
    }

    if (field === 'remote' || field === 'remote.exports') {
      const remote = toRemote({ manifest, url, onExportClick });
      if (remote.hasExports) {
        if (field === 'remote') list.push(remote.item);
        if (field === 'remote.exports') list.push(...remote.exports);
      }
    }
  };

  // Assemble list.
  fields.filter((field) => fields.includes(field)).forEach((field) => add(field));
  return list;
}
