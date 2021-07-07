import { Clean, ManifestSource, semver, t, time, Uri } from './common';

/**
 * Handles storing module registry data for a single namespace.
 */
export function ModuleRegistryNamespace(args: {
  http: t.IHttpClient;
  domain: string;
  namespace: string;
  uri: t.ICellUri | string;
}) {
  const { http, domain } = args;
  const namespace = Clean.namespace(args.namespace, { throw: true });
  const uri = Uri.cell(args.uri);

  const Filter = {
    versionEntry(list: t.RegistryNamespaceVersion[], match: string) {
      return list.find((item) => semver.satisfies(item.version, match));
    },
    versionIndex(list: t.RegistryNamespaceVersion[], match: string) {
      return list.findIndex((item) => semver.satisfies(item.version, match));
    },
  };

  const api = {
    uri,
    name: namespace,
    domain,

    /**
     * Retrieve the entry for the given version.
     */
    async version(version: string) {
      return Filter.versionEntry(await api.read(), version);
    },

    /**
     * Retrieve the entry with the latest version.
     */
    async latest() {
      const versions = await api.read({ order: 'desc' });
      return versions[0];
    },

    /**
     * Retrieve referenced versions of the namespace.
     */
    async read(options: { order?: 'asc' | 'desc' } = {}) {
      type V = t.RegistryNamespaceVersion;
      const { order = 'desc' } = options;
      const cell = http.cell(uri);
      const info = (await cell.db.props.read<t.RegistryCellPropsNamespace>()).body;
      const compare = (a: V, b: V) =>
        order === 'asc'
          ? semver.compare(a.version, b.version)
          : semver.compare(b.version, a.version);
      return (info?.versions ?? []).sort(compare);
    },

    /**
     * Write a manifest to the list of namespace versions.
     */
    async write(args: { source: t.ManifestSourceAddress; manifest: t.ModuleManifest }) {
      const { manifest } = args;

      if (manifest.module.namespace !== namespace) {
        throw new Error(`Namespace mismatch`);
      }

      const source = ManifestSource(args.source);
      const versions = await api.read();
      const index = Filter.versionIndex(versions, manifest.module.version);
      const exists = index >= 0;

      const create = (): t.RegistryNamespaceVersion => {
        const now = time.now.timestamp;
        return {
          kind: 'registry:module',
          createdAt: now,
          modifiedAt: now,
          version: manifest.module.version,
          hash: manifest.hash.module,
          source: source.path,
          fs: Uri.create.A1(),
        };
      };

      const update = (input: t.RegistryNamespaceVersion): t.RegistryNamespaceVersion => {
        return {
          ...input,
          modifiedAt: time.now.timestamp,
          version: manifest.module.version,
          hash: manifest.hash.module,
          source: source.path,
        };
      };

      // Get or create {entry}.
      const entry = exists ? update(versions[index]) : create();
      versions[exists ? index : versions.length] = entry;

      // Write to DB.
      type P = Partial<t.RegistryCellPropsNamespace>;
      const cell = http.cell(uri);
      const res = await cell.db.props.write<P>({ versions });
      if (!res.ok) throw new Error(`Failed to write manifest to database. ${res.error?.message}`);

      // Finish up.
      return {
        action: !exists ? 'created' : 'updated',
        entry,
      };
    },

    async delete(version?: string) {
      version = (version || '').trim();
      const versions = await api.read();

      if (!version && versions.length === 0) return;
      if (version && !versions.map((m) => m.version).includes(version)) return;

      // Delete files.
      await Promise.all(
        versions.map(async (item) => {
          if (!version || item.version === version) {
            const cell = http.cell(item.fs);
            const filenames = (await cell.links.read()).body.files.map((link) => link.path);
            await cell.fs.delete(filenames);
          }
        }),
      );

      // Delete database properties.
      const writeDb = async (versions: t.RegistryNamespaceVersion[]) => {
        type P = Partial<t.RegistryCellPropsNamespace>;
        const cell = http.cell(uri);
        const res = await cell.db.props.write<P>({ versions });
        if (!res.ok) throw new Error(`Failed to write manifest to database. ${res.error?.message}`);
      };

      if (!version) await writeDb([]);
      if (version) await writeDb(versions.filter((item) => item.version !== version));
    },

    /**
     * Convert to string.
     */
    toString: () => `[ModuleRegistryNamespace:${domain}/${namespace}]`,
  };

  return api;
}
