import { t } from '../common';

type D = t.ITypeDefPayload;
export type SampleTypeDefs = {
  'ns:foo': D;
  'ns:foo.color': D;
  'ns:foo.primitives': D;
  'ns:foo.enum': D;
  'ns:foo.messages': D;
  'ns:foo.message': D;
  'ns:foo.nested': D;
};

export const TYPE_DEFS: SampleTypeDefs = {
  'ns:foo': {
    ns: { type: { typename: 'MyRow' } },
    columns: {
      A: { props: { prop: { name: 'title', type: 'string' } } },
      B: {
        props: { prop: { name: 'isEnabled', type: 'boolean | null', target: 'inline:isEnabled' } },
      },
      C: {
        props: { prop: { name: 'color?', type: 'ns:foo.color', target: 'inline:color' } },
      },
      D: { props: { prop: { name: 'message', type: 'ns:foo.message | null', target: 'ref' } } },
      E: { props: { prop: { name: 'messages', type: 'ns:foo.message[]', target: 'ref' } } },
    },
  },

  'ns:foo.color': {
    ns: { type: { typename: 'MyColor' } },
    columns: {
      A: { props: { prop: { name: 'label', type: 'string' } } },
      B: { props: { prop: { name: 'color', type: '"red" | "green" | "blue"' } } },
      C: { props: { prop: { name: 'description?', type: 'string' } } },
    },
  },

  'ns:foo.primitives': {
    ns: { type: { typename: 'Primitives' } },
    columns: {
      A: { props: { prop: { name: 'myString', type: 'string' } } },
      B: { props: { prop: { name: 'myNumber', type: 'number' } } },
      C: { props: { prop: { name: 'myBoolean', type: 'boolean' } } },
      D: { props: { prop: { name: 'myNull', type: 'null' } } },
      E: { props: { prop: { name: 'myUndefined', type: 'undefined' } } },
    },
  },

  'ns:foo.enum': {
    ns: { type: { typename: 'Enum' } },
    columns: {
      A: { props: { prop: { name: 'single', type: '"hello"' } } },
      B: { props: { prop: { name: 'colors', type: '"red" | "green" | "blue"[]' } } },
    },
  },

  'ns:foo.messages': {
    ns: { type: { typename: 'MyMessages' } },
    columns: {
      A: { props: { prop: { name: 'channel', type: 'string' } } },
      B: { props: { prop: { name: 'color', type: 'ns:foo.color', target: 'ref' } } },
      C: { props: { prop: { name: 'messages', type: 'ns:foo.message[]', target: 'ref' } } },
    },
  },

  'ns:foo.message': {
    ns: { type: { typename: 'MyMessage' } },
    columns: {
      A: { props: { prop: { name: 'date', type: 'number' } } },
      B: { props: { prop: { name: 'user', type: 'string' } } },
      C: { props: { prop: { name: 'message', type: 'string' } } },
    },
  },

  'ns:foo.nested': {
    ns: { type: { typename: 'MyNested' } },
    columns: {
      A: { props: { prop: { name: 'one', type: '(string)' } } },
      B: {
        props: { prop: { name: 'two', type: 'string | ("red" | boolean | "blue")' } },
      },
      C: { props: { prop: { name: 'three', type: 'boolean | (ns:foo.color | string)' } } },
    },
  },
};
