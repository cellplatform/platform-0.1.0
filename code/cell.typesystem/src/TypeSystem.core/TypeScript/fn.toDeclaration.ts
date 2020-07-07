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

export type FilterType = (args: FilterTypeArgs) => boolean | any;
export type FilterTypeArgs = { typename: string };

/**
 * Generate a typescript declaration file.
 */
export function toDeclaration(args: {
  typename: string;
  types: t.ITypeDef[];
  header?: string;
  imports?: string;
  adjustLine?: AdjustType;
  filterType?: FilterType;
  exports?: boolean;
  priorCode?: string;
}) {
  const { adjustLine, filterType, priorCode } = args;
  const declare = args.exports === false ? 'declare' : 'export declare';

  const includedInGivenTypes = (typename: string) =>
    args.types.some((def) => def.type.typename === typename);

  const write = (args: { typename: string; types: t.ITypeDef[]; written: string[] }) => {
    const { written } = args;
    if (written.includes(args.typename)) {
      return '';
    }

    if (filterType) {
      const res = filterType({ typename: args.typename });
      if (res === false) {
        return '';
      }
    }

    if (priorCode && priorCode.includes(`declare type ${args.typename} = {`)) {
      return '';
    }

    const parentType = args.typename;
    const childRefs: t.ITypeRef[] = [];

    let lines = args.types.map((typeDef) => {
      const { prop, type } = typeDef;
      if (type.kind === 'UNION') {
        // Build up list of referenced types to ensure these are included in the output.
        type.types
          .filter(({ kind }) => kind !== 'UNION')
          .filter(({ kind }) => kind === 'REF')
          .filter(({ typename }) => includedInGivenTypes(typename))
          .forEach((ref) => childRefs.push(ref as t.ITypeRef));
      }
      const typename = TypeValue.toTypename(type);
      const optional = typeDef.optional ? '?' : '';
      let line: string | undefined = `  ${prop}${optional}: ${typename};`;

      // Run an adjustment handler on the field's type.
      // NB: This is useful for doing things like:
      //      - convert a field's type to a "Promise<Type>"
      //      - swap the response type out entirely for some synthetic wrapper object.
      //
      if (adjustLine) {
        adjustLine({
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

    lines = lines.filter((line) => typeof line === 'string').map((line) => line.trimEnd());

    let res = `
${declare} type ${args.typename} = {
${lines.join('\n')}
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
      .filter((type) => type.kind === 'REF')
      .filter((ref) => includedInGivenTypes(ref.typename))
      .filter((ref) => !childRefs.some(({ typename }) => typename === ref.typename))
      .filter((ref) => !written.includes(ref.typename))
      .filter((ref) => ref.types.length > 0)
      .forEach((ref) => childRefs.push(ref));

    childRefs.forEach((ref) => writeRef(ref));

    return res;
  };

  // Write lines of code.
  let text = write({ ...args, written: [] });

  // Prepare document body.
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
  let lines = (imports || '').split('\n').map((line) => formatImport(line));
  lines = trimEmptyLines(lines);
  return lines.join('\n');
}

function formatImport(line: string) {
  line = (line || '').trim().replace(/;*$/, '').replace(/\"/g, `'`);
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
