import { t } from '../../common';

/**
 * (Visitor Pattern) Walks a type tree calling the given
 * function at each level.
 */
export function walk(type: t.IType, onVisit: t.TypeVisit) {
  const root = type;

  const walk = (level: number, type: t.IType, path: string) => {
    if (type.kind === 'REF') {
      type.types.forEach(child => {
        const args: t.TypeVisitArgs = {
          level: level + 1,
          path: path ? `${path}.${child.prop}` : child.prop,
          root,
          prop: child.prop,
          type: child.type,
          optional: child.optional,
        };
        onVisit(args);
        walk(args.level, child.type, args.path); // <== RECURSION 🌳
      });
    }

    if (type.kind === 'UNION') {
      type.types.forEach(child => {
        const args: t.TypeVisitArgs = {
          level: level + 1,
          path,
          root,
          type: child,
        };
        onVisit(args);
        walk(args.level, child, args.path); // <== RECURSION 🌳
      });
    }
  };

  walk(0, type, '');
}
