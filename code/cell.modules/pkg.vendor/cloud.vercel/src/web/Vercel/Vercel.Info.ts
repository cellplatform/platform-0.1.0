import { t, Filesize } from '../common';
import { VercelFs } from './Vercel.Fs';

export const VercelInfo = {
  /**
   * Derive information about a deployment bundle.
   */
  async bundle(args: { fs: t.Fs; source: string | t.VercelSourceBundle; name?: string }) {
    const { fs, source } = args;
    const manifest = await VercelFs.wrangleManifest({ fs, source });
    const bundle = typeof source === 'string' ? await VercelFs.readdir(fs, source) : source;
    let name = args.name;

    let meta: t.VercelHttpDeployMeta = {
      kind: 'bundle:plain/files',
      version: '0.0.0',
      fileshash: bundle.manifest.hash.files,
      bytes: bundle.manifest.files.reduce((acc, next) => acc + next.bytes, 0).toString(),
    };

    if (manifest) {
      const kind = (manifest as any)?.kind;
      if (kind === 'module') {
        const m = manifest as t.ModuleManifest;
        const { namespace, version } = m.module;
        meta = {
          ...meta,
          kind: 'bundle:code/module',
          version,
          namespace,
        };
        name = name ?? `${namespace}-v${version}`;
      }
    }

    const size = {
      bytes: bundle.manifest.files.reduce((acc, next) => acc + next.bytes, 0),
      toString: () => Filesize(size.bytes),
    };

    const files = {
      total: bundle.files.length,
      hash: meta.fileshash,
      toString() {
        const total = files.total;
        const fileSummary = `${total} ${total === 1 ? 'file' : 'files'}`;
        const sha256 = meta.fileshash.substring('sha256-'.length);
        const hash = `SHA256( ${sha256.substring(0, 5)}..${sha256.substring(sha256.length - 5)} )`;
        return `${size.toString()} (${fileSummary}) | ${hash}`;
      },
    };

    // Final preparation of meta-data.
    const version = meta.version;
    Object.keys(meta).map((key) => (meta[key] = meta[key].toString())); // NB: Ensure all values are strings.
    name = name ?? `unnamed-v${version}`;

    // Finish up.
    return {
      name,
      version,
      meta,
      files,
      size,
    };
  },
};
