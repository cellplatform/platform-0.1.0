import { ManifestUrl, t, time } from '../common';
import { toFiles } from './item.files';
import { toHash } from './item.hash';
import { toRemote } from './item.remote';
import { toSourceUrl } from './item.source';

type P = t.PropListItem;

export function toPropsList(args: {
  manifest?: t.ModuleManifest;
  url?: string;
  fields: t.ModuleInfoFields[];
  theme: t.ModuleInfoTheme;
  onExportClick?: t.ModuleInfoExportClick;
}): t.PropListItem[] {
  const { manifest, onExportClick, fields, theme } = args;

  if (!manifest) return [];

  const url = ManifestUrl.parse(args.url ?? '');
  const module = manifest.module;
  const elapsed = time.duration(time.now.timestamp - module.compiledAt);

  /**
   * Base properties.
   */
  const list: P[] = [];
  const add = (field: t.ModuleInfoFields) => {
    const is = (...match: t.ModuleInfoFields[]) => match.includes(field);
    const href = url.href;

    if (is('source:url') && href) {
      list.push(toSourceUrl({ href, theme }));
    }

    if (is('source:url:hash') && href) {
      const hash = manifest.hash.module;
      if (hash) list.push(toSourceUrl({ href, hash, theme }));
    }

    if (is('source:url:entry') && href) {
      const entry = (new URL(href).searchParams.get('entry') || '').replace(/^\.\//, '');
      list.push({
        label: 'entry',
        value: entry || '-',
      });
    }

    if (is('namespace')) {
      list.push({
        label: 'namespace',
        value: { data: module.namespace, clipboard: true },
      });
    }

    if (is('version')) {
      list.push({
        label: 'version',
        value: { data: `${module.version}`, clipboard: module.version },
      });
    }

    if (is('hash.module', 'hash.files')) {
      list.push(toHash({ manifest, field, theme }));
    }

    if (is('compiled')) {
      const clipboard = `Compilation: ${module.compiler} (${elapsed.toString()} ago)`;
      list.push({
        label: 'compiled',
        value: { data: `${elapsed.toString()} ago`, clipboard },
        tooltip: module.compiler,
      });
    }

    if (is('kind')) {
      list.push({
        label: 'kind',
        value: `${module.target}, ${module.mode}`,
      });
    }

    if (is('files')) {
      list.push(toFiles({ manifest }));
    }

    if (is('remote', 'remote.exports')) {
      const remote = toRemote({ manifest, theme, url, onExportClick });
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
