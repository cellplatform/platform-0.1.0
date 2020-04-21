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
  'ns:foo.defaults': D;
};

export const TYPE_DEFS: SampleTypeDefs = {
  'ns:foo': {
    ns: { type: { typename: 'MyRow' } },
    columns: {
      A: {
        props: {
          def: {
            prop: 'title',
            type: 'string',
            default: 'Untitled',
          },
        },
      },
      B: {
        props: { def: { prop: 'isEnabled', type: 'boolean | null', target: 'inline:isEnabled' } },
      },
      C: {
        props: { def: { prop: 'color?', type: 'ns:foo.color', target: 'inline:color' } },
      },
      D: { props: { def: { prop: 'message', type: 'ns:foo.message | null', target: 'ref' } } },
      E: { props: { def: { prop: 'messages', type: 'ns:foo.message[]', target: 'ref' } } },
    },
  },

  'ns:foo.color': {
    ns: { type: { typename: 'MyColor' } },
    columns: {
      A: { props: { def: { prop: 'label', type: 'string' } } },
      B: { props: { def: { prop: 'color', type: '"red" | "green" | "blue"' } } },
      C: { props: { def: { prop: 'description?', type: 'string' } } },
    },
  },

  'ns:foo.primitives': {
    ns: { type: { typename: 'Primitives' } },
    columns: {
      A: {
        props: {
          def: { prop: 'stringValue', type: 'string', default: { value: 'Hello (Default)' } },
        },
      },
      B: { props: { def: { prop: 'numberValue', type: 'number', default: 999 } } },
      C: { props: { def: { prop: 'booleanValue', type: 'boolean', default: true } } },
      D: { props: { def: { prop: 'nullValue', type: 'null | string | number', default: null } } },
      E: { props: { def: { prop: 'undefinedValue?', type: 'string' } } },

      F: { props: { def: { prop: 'stringProp', type: 'string', target: 'inline:string' } } },
      G: { props: { def: { prop: 'numberProp', type: 'number', target: 'inline:number' } } },
      H: { props: { def: { prop: 'booleanProp', type: 'boolean', target: 'inline:boolean' } } },
      I: { props: { def: { prop: 'nullProp', type: 'null | number', target: 'inline:null' } } },
      K: {
        props: { def: { prop: 'undefinedProp?', type: 'string', target: 'inline:undefined' } },
      },
    },
  },

  'ns:foo.enum': {
    ns: { type: { typename: 'Enum' } },
    columns: {
      A: { props: { def: { prop: 'single?', type: '"hello"' } } },
      B: { props: { def: { prop: 'union', type: '"red" | "green" | "blue"[]' } } },
      C: { props: { def: { prop: 'array', type: '("red" | "green" | "blue")[]' } } },
    },
  },

  'ns:foo.messages': {
    ns: { type: { typename: 'MyMessages' } },
    columns: {
      A: { props: { def: { prop: 'channel', type: 'string' } } },
      B: { props: { def: { prop: 'color?', type: 'ns:foo.color', target: 'ref' } } },
      C: { props: { def: { prop: 'messages', type: 'ns:foo.message[]', target: 'ref' } } },
    },
  },

  'ns:foo.message': {
    ns: { type: { typename: 'MyMessage' } },
    columns: {
      A: { props: { def: { prop: 'date', type: 'number', default: -1 } } },
      B: { props: { def: { prop: 'user', type: 'string', default: 'anon' } } },
      C: { props: { def: { prop: 'message', type: 'string' } } },
    },
  },

  'ns:foo.nested': {
    ns: { type: { typename: 'MyNested' } },
    columns: {
      A: { props: { def: { prop: 'one', type: '(string)' } } },
      B: { props: { def: { prop: 'two', type: 'string | ("red" | boolean | "blue")' } } },
      C: { props: { def: { prop: 'three', type: 'boolean | (ns:foo.color | string)' } } },
    },
  },

  'ns:foo.defaults': {
    ns: { type: { typename: 'MyDefaults' } },
    columns: {
      A: { props: { def: { prop: 'title', type: 'string', default: 'Untitled' } } },
      B: {
        props: { def: { prop: 'foo', type: 'string', default: { ref: 'cell:foo.sample:A1' } } },
      },
    },
  },
};
