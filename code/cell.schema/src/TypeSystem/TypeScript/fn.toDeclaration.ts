import { t } from '../common';

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

    const toTypename = (type: t.IType): string => {
      if (typeof type === 'string') {
        return type;
      }
      if (type.kind === 'UNION') {
        type.types
          .filter(({ kind }) => kind !== 'UNION')
          .filter(({ kind }) => kind === 'REF')
          .forEach(ref => childRefs.push(ref as t.ITypeRef));
        return type.types.map(type => toTypename(type)).join(' | '); // <== RECURSION 🌳
      }
      return type.typename;
    };

    const lines = args.types.map(item => {
      const prop = item.prop;
      const typename = toTypename(item.type);
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
