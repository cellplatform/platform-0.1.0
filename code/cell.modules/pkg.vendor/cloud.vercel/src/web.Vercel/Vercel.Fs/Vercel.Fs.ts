import { t, Filesize } from '../common';

type DirPath = string;

/**
 * Filesystem helpers for working with Vercel.
 */
export const VercelFs = {
  /**
   * Read directory into a "bundle" (manifest WITH binary file data).
   */
  async readdir(fs: t.Fs, path?: DirPath) {
    if (typeof path === 'string' && !(await fs.is.dir(path))) {
      throw new Error(`Path is not a directory: "${path}"`);
    }

    const dir = fs.dir(path ?? '');
    const manifest = await dir.manifest();
    const wait = manifest.files.map(async ({ path }) => ({ path, data: await dir.read(path) }));
    const files: t.VercelFile[] = (await Promise.all(wait)).filter((file) => Boolean(file.data));
    const bundle: t.VercelSourceBundle = { files, manifest };

    return bundle;
  },

  /**
   * Attempt to load the manifest for a bundle.
   */
  wrangleManifest(args: { fs: t.Fs; source: string | t.VercelSourceBundle }) {
    const { fs, source } = args;

    if (typeof source === 'string') {
      return fs.json.read<t.Manifest>(fs.join(source, 'index.json'));
    }

    const file = source.files.find((file) => file.path === 'index.json');
    if (file?.data) {
      const text = new TextDecoder().decode(file.data);
      return JSON.parse(text) as t.Manifest;
    }

    return undefined;
  },

  /**
   * Derive meta-data for a source bundle.
   */
  async info(args: { fs: t.Fs; source: string | t.VercelSourceBundle; name?: string }) {
    const { fs, source } = args;
    const manifest = await VercelFs.wrangleManifest({ fs, source });
    const bundle = typeof source === 'string' ? await VercelFs.readdir(fs, source) : source;
    let name = args.name;

    let version = '0.0.0';
    let meta: t.VercelHttpDeployMeta = { kind: 'bundle:plain/files', version, fileshash: '' };

    if (manifest) {
      const kind = (manifest as any)?.kind;
      if (kind === 'module') {
        const m = manifest as t.ModuleManifest;
        const module = { ...m.module };
        version = m.module.version;

        Object.keys(module)
          .filter((key) => typeof module[key] === 'object')
          .forEach((key) => delete module[key]); // NB: Meta-data cannot be an {object}.

        name = name ?? `${module.namespace}-v${module.version}`;
        const bytes = m.files.reduce((acc, next) => acc + next.bytes, 0).toString();
        meta = {
          ...module,
          kind: 'bundle:code/module',
          modulehash: m.hash.module,
          fileshash: m.hash.files,
          bytes,
        };
      }
      meta.fileshash = manifest.hash.files;
    }

    if (!manifest) {
      meta.fileshash = bundle.manifest.hash.files;
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

        const h = meta.fileshash.substring('sha256-'.length);
        const hash = `SHA256( ${h.substring(0, 5)}..${h.substring(h.length - 5)} )`;

        return `${size.toString()} (${fileSummary}) | ${hash}`;
      },
    };

    // Finish up.
    Object.keys(meta).map((key) => (meta[key] = meta[key].toString())); // NB: Ensure all values are strings.
    name = name ?? `unnamed-v${version}`;
    return { name, version, meta, files, size };
  },
};
