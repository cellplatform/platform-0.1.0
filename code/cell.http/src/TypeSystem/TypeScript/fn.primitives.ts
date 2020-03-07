import { t } from '../common';

export const primitives: t.ITypePrimitives = {
  get string(): t.ITypeValue {
    return { kind: 'VALUE', typename: 'string' };
  },
  get number(): t.ITypeValue {
    return { kind: 'VALUE', typename: 'number' };
  },
  get boolean(): t.ITypeValue {
    return { kind: 'VALUE', typename: 'boolean' };
  },
  get null(): t.ITypeValue {
    return { kind: 'VALUE', typename: 'null' };
  },
  get undefined(): t.ITypeValue {
    return { kind: 'VALUE', typename: 'undefined' };
  },
};
