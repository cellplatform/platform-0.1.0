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

      // The current module executing the code generator.
      const PKG = constants.PKG;
      const pkg = toPkg(PKG.name, PKG.version);

      // The current schema used to generate the code.
      return toTypescriptHeader({ uri, pkg });
    },

    /**
     * Generated typescript declarations(s).
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
      if (def.errors.length > 0) {
        const errors = def.errors.map(err => err.message).join('\n');
        throw new Error(`Cannot save definition to typescript as it contains errors.\n${errors}`);
      }

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
