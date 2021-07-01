import { t, Uri, d, semver, time } from './common';
import { Clean } from './util';
import { ManifestSource } from './ManifestSource';

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
    versionEntry(list: d.RegistryNamespaceVersion[], match: string) {
      return list.find((item) => semver.satisfies(item.version, match));
    },
    versionIndex(list: d.RegistryNamespaceVersion[], match: string) {
      return list.findIndex((item) => semver.satisfies(item.version, match));
    },
  };

  const api = {
    uri,
    namespace,
    domain,

    /**
     * Retrieve referenced versions of the namespace.
     */
    async versions() {
      const cell = http.cell(uri);
      const info = (await cell.db.props.read<d.RegistryCellPropsNamespace>()).body;
      const versions = (info?.versions ?? []).sort((a, b) => semver.compare(a.version, b.version));
      return versions;
    },

    /**
     * Retrieve the entry for the given version.
     */
    async read(semver: string) {
      return Filter.versionEntry(await api.versions(), semver);
    },

    /**
     * Write a manifest to the list of namespace versions.
     */
    async write(args: { source: d.ManifestSource; manifest: t.ModuleManifest }) {
      const { manifest } = args;

      if (manifest.module.namespace !== namespace) {
        throw new Error(`Namespace mismatch`);
      }

      const source = ManifestSource(args.source);
      const versions = await api.versions();
      const index = Filter.versionIndex(versions, manifest.module.version);
      const exists = index >= 0;

      const create = (): d.RegistryNamespaceVersion => {
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

      const update = (input: d.RegistryNamespaceVersion): d.RegistryNamespaceVersion => {
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
      versions[index < 0 ? 0 : index] = entry;

      // Write to DB.
      type P = Partial<d.RegistryCellPropsNamespace>;
      const cell = http.cell(uri);
      const res = await cell.db.props.write<P>({ versions });
      if (!res.ok) throw new Error(`Failed to write manifest to database. ${res.error?.message}`);

      // Finish up.
      return {
        action: !exists ? 'created' : 'updated',
        entry,
      };
    },

    /**
     * Convert to string.
     */
    toString: () => `[ModuleRegistryNamespace:${domain}/${namespace}]`,
  };

  return api;
}
