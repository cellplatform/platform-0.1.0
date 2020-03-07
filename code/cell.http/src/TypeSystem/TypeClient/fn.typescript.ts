import { constants, t, value } from '../common';
import { TypeScript } from '../TypeScript';
import { toTypescriptHeader } from './fn.typescript.header';

/**
 * Converts type definitions to valid typescript declarations.
 */

export function typescript(def: t.INsTypeDef, options: { header?: boolean } = {}) {
  const api = {
    /**
     * Comments to insert at the head of the typescript.
     */
    get header() {
      const uri = def.uri;

      const toPkg = (name?: string, version?: string) => {
        const pkg = { name: name || 'Unnamed', version: version || '0.0.0' };
        return pkg;
      };

      const PKG = constants.PKG;
      const DEPS = PKG.dependencies || {};

      // The current module executing the code generator.
      const pkg = toPkg(PKG.name, PKG.version);

      // The current schema used to generate the code.
      const schemaKey = '@platform/cell.schema';
      const schemaRef = DEPS[schemaKey];
      const schema = toPkg(schemaKey, schemaRef);

      return toTypescriptHeader({ uri, pkg, schema });
    },

    /**
     * Generated typescript decalration(s).
     */
    get declaration() {
      const header = value.defaultValue(options.header, true) ? api.header : undefined;
      const typename = def.typename;
      const types = def.columns.map(({ prop, type, optional }) => ({ prop, type, optional }));
      return TypeScript.toDeclaration({ typename, types, header });
    },

    /**
     * Save the typescript declarations as a binary file.
     */
    async save(fs: t.IFs, dir: string, options: { filename?: string } = {}) {
      // Prepare paths.
      await fs.ensureDir(dir);
      let path = fs.join(dir, options.filename || def.typename);
      path = path.endsWith('.d.ts') ? path : `${path}.d.ts`;

      // Save file.
      const data = api.declaration;
      await fs.writeFile(path, data);
      return { path, data };
    },

    toString() {
      return api.declaration;
    },
  };

  return api;
}
