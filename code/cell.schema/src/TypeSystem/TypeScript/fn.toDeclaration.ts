import { t } from '../common';
import { TypeValue } from '../TypeValue';

/**
 * Generate a typescript declaration file.
 */
export function toDeclaration(args: { typename: string; types: t.ITypeDef[]; header?: string }) {
  const write = (args: { typename: string; types: t.ITypeDef[]; written: string[] }) => {
    const { written } = args;
    if (written.includes(args.typename)) {
      return '';
    }

    const childRefs: t.ITypeRef[] = [];

    const lines = args.types.map(item => {
      const { prop, type } = item;
      if (type.kind === 'UNION') {
        // Build up list of referenced types to ensure these are included in the output.
        type.types
          .filter(({ kind }) => kind !== 'UNION')
          .filter(({ kind }) => kind === 'REF')
          .forEach(ref => childRefs.push(ref as t.ITypeRef));
      }
      const typename = TypeValue.toTypename(type);
      const optional = item.optional ? '?' : '';
      return `  ${prop}${optional}: ${typename};`;
    });

    let res = `
export declare type ${args.typename} = {
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
      .filter(type => type.kind === 'REF')
      .forEach(ref => writeRef(ref));

    childRefs.forEach(ref => writeRef(ref));

    return res;
  };

  let text = write({ ...args, written: [] });
  text = args.header ? `${args.header}\n\n${text}` : text;
  return `${text}\n`;
}
