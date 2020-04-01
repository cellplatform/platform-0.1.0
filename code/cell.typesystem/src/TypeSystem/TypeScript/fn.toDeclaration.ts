import { t } from '../../common';
import { TypeValue } from '../TypeValue';

export type AdjustType = (args: AdjustTypeArgs) => void;
export type AdjustTypeArgs = {
  parentType: string;
  line: string;
  typeDef: t.ITypeDef;
  type: t.IType;
  prop: string;
  optional: string;
  typename: string;
  adjust(line: string): void;
};

/**
 * Generate a typescript declaration file.
 */
export function toDeclaration(args: {
  typename: string;
  types: t.ITypeDef[];
  header?: string;
  imports?: string;
  adjustLine?: AdjustType;
}) {
  const { adjustLine: adjustType } = args;

  const write = (args: { typename: string; types: t.ITypeDef[]; written: string[] }) => {
    const { written } = args;
    if (written.includes(args.typename)) {
      return '';
    }

    const parentType = args.typename;
    const childRefs: t.ITypeRef[] = [];

    const lines = args.types.map(typeDef => {
      const { prop, type } = typeDef;
      if (type.kind === 'UNION') {
        // Build up list of referenced types to ensure these are included in the output.
        type.types
          .filter(({ kind }) => kind !== 'UNION')
          .filter(({ kind }) => kind === 'REF')
          .forEach(ref => childRefs.push(ref as t.ITypeRef));
      }
      const typename = TypeValue.toTypename(type);
      const optional = typeDef.optional ? '?' : '';
      let line: string | undefined = `  ${prop}${optional}: ${typename};`;

      // Run an adjustment handler on the field's type.
      // NB: This is useful for doing things like:
      //      - convert a field's type to a "Promise<Type>"
      //      - swap the response type out entirely for some synthetic wrapper object.
      //
      if (adjustType) {
        adjustType({
          parentType,
          line,
          typeDef,
          type,
          prop,
          optional,
          typename,
          adjust(change: string) {
            change = (change || '').trim().replace(/;*$/, '');
            line = change ? `  ${change};` : '';
          },
        });
      }

      return line;
    });

    let res = `
export declare type ${args.typename} = {
${lines.filter(line => typeof line === 'string').join('\n')}
};`.substring(1);

    written.push(args.typename);

    const writeRef = (type: t.ITypeRef) => {
      const { typename, types } = type;
      const declaration = write({ typename, types, written }); // <== RECURSION 🌳
      if (declaration) {
        res = `${res}\n\n${declaration}`;
      }
    };

    args.types
      .map(({ type }) => type as t.ITypeRef)
      .filter(type => type.kind === 'REF')
      .forEach(ref => writeRef(ref));

    childRefs.forEach(ref => writeRef(ref));

    return res;
  };

  // Prepare document body.
  let text = write({ ...args, written: [] });
  const prepend = (content?: string) => (text = content ? `${content}\n\n${text}` : text);

  prepend(formatImports(args.imports));
  prepend(args.header);

  // Finish up.
  return `${text}\n`;
}

/**
 * [Helpers]
 */

function formatImports(imports?: string) {
  let lines = (imports || '').split('\n').map(line => formatImport(line));
  lines = trimEmptyLines(lines);
  return lines.join('\n');
}

function formatImport(line: string) {
  line = (line || '')
    .trim()
    .replace(/;*$/, '')
    .replace(/\"/g, `'`);
  return (line ? `${line};` : line).trim();
}

function trimEmptyLines(lines: string[]) {
  lines = !lines[0] ? lines.slice(1) : lines; // NB: Blank first line.
  const last = lines[lines.length - 1];
  if (typeof last === 'string' && !last) {
    lines.pop();
  }
  return lines;
}
