import { constants, t, value } from '../../common';
import { TypeScript } from '../TypeScript';
import { toTypescriptHeader } from './TypeClient.fn.typescript.header';
import { TypeValue } from '../TypeValue';
import { TypeTarget } from '../TypeTarget';

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
      const types = def.columns.map(({ prop, type, optional, target }) => ({
        prop,
        type,
        optional,
        target,
      }));
      return TypeScript.toDeclaration({
        typename,
        types,
        header,
        imports: `import * as t from '@platform/cell.types';`,
        adjustLine(e) {
          const target = e.typeDef.target;
          const typename = TypeValue.toTypename(e.type, {
            adjust(line) {
              if (line.type.kind === 'REF' && TypeTarget.isRef(target)) {
                const T = line.type.typename;
                const name = line.type.isArray
                  ? `t.ITypedSheetRefs<${T}>`
                  : `t.ITypedSheetRef<${T}>`;
                line.adjust(name);
              }
            },
          });
          if (typename !== e.typename) {
            e.adjust(`${e.prop}${e.optional}: ${typename}`);
          }
        },
      });
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
      path = path.endsWith('.ts') ? path : `${path}.ts`;

      // Generate the typescript.
      const filename = path.substring(path.lastIndexOf('/') + 1);
      const text = api.declaration.replace(/\<filename\>\.ts/g, filename);

      // Save file.
      await fs.writeFile(path, text);
      return { path, text };
    },

    toString() {
      return api.declaration;
    },
  };

  return api;
}
