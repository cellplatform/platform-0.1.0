import { constants, t, value, R } from '../../common';
import { TypeScript } from '../TypeScript';
import { toTypescriptHeader } from './TypeClient.fn.typescript.header';
import { TypeValue } from '../TypeValue';
import { TypeTarget } from '../TypeTarget';

/**
 * Converts type definitions to valid typescript declarations.
 */
export function typescript(def: t.INsTypeDef | t.INsTypeDef[], options: { header?: boolean } = {}) {
  const defs = Array.isArray(def) ? def : [def];
  const api = {
    /**
     * Comments to insert at the head of the typescript.
     */
    get header() {
      const uri = R.uniq(defs.map(def => def.uri));

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

      let isRefUsed = false;
      const addedTypenames: string[] = [];

      const toDeclaration = (typename: string) => {
        const def = defs.find(def => def.typename === typename);
        if (!def) {
          return '';
        }
        return TypeScript.toDeclaration({
          typename,
          types: def.columns,
          filterType: e => {
            const exists = addedTypenames.includes(e.typename);
            addedTypenames.push(e.typename);
            return !exists;
          },
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
                  isRefUsed = true;
                }
              },
            });
            if (typename !== e.typename) {
              e.adjust(`${e.prop}${e.optional}: ${typename}`);
            }
          },
        });
      };

      const typenames = R.uniq(defs.map(def => def.typename));
      const code = typenames.map(typename => toDeclaration(typename)).join('\n');
      const imports = `import * as t from '@platform/cell.types';`;

      let res = '';
      res = !header ? res : `${res}\n${header}\n`;
      res = !isRefUsed ? res : `${res}\n${imports}\n`;
      res = `${res}\n${code}`;
      res = res[0] === '\n' ? res.substring(1) : res; // NB: Trim first new-line.
      res = res.replace(/\n{3,}/g, '\n\n'); // NB: collapse any multi-line spaces.
      res = res.replace(/\n*$/, '');
      res = res.length > 0 ? `${res}\n` : res;

      return res;
    },

    /**
     * Save the typescript declarations as a binary file.
     */
    async save(fs: t.IFs, path: string) {
      const errors = defs.reduce((acc, next) => [...acc, ...next.errors], [] as t.ITypeError[]);
      if (errors.length > 0) {
        const lines = errors.map((err, i) => `${i + 1}) ${err.message}`).join('\n');
        throw new Error(`Cannot save definition to typescript as it contains errors:\n${lines}`);
      }

      // Prepare paths.
      path = path.endsWith('.ts') ? path : `${path}.ts`;
      await fs.ensureDir(fs.dirname(path));

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
