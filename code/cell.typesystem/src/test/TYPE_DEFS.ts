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
            name: 'title',
            type: 'string',
            default: 'Untitled',
          },
        },
      },
      B: {
        props: { def: { name: 'isEnabled', type: 'boolean | null', target: 'inline:isEnabled' } },
      },
      C: {
        props: { def: { name: 'color?', type: 'ns:foo.color', target: 'inline:color' } },
      },
      D: { props: { def: { name: 'message', type: 'ns:foo.message | null', target: 'ref' } } },
      E: { props: { def: { name: 'messages', type: 'ns:foo.message[]', target: 'ref' } } },
    },
  },

  'ns:foo.color': {
    ns: { type: { typename: 'MyColor' } },
    columns: {
      A: { props: { def: { name: 'label', type: 'string' } } },
      B: { props: { def: { name: 'color', type: '"red" | "green" | "blue"' } } },
      C: { props: { def: { name: 'description?', type: 'string' } } },
    },
  },

  'ns:foo.primitives': {
    ns: { type: { typename: 'Primitives' } },
    columns: {
      A: {
        props: {
          def: { name: 'stringValue', type: 'string', default: { value: 'Hello (Default)' } },
        },
      },
      B: { props: { def: { name: 'numberValue', type: 'number', default: 999 } } },
      C: { props: { def: { name: 'booleanValue', type: 'boolean', default: true } } },
      D: { props: { def: { name: 'nullValue', type: 'null | string | number', default: null } } },
      E: { props: { def: { name: 'undefinedValue?', type: 'string' } } },

      F: { props: { def: { name: 'stringProp', type: 'string', target: 'inline:string' } } },
      G: { props: { def: { name: 'numberProp', type: 'number', target: 'inline:number' } } },
      H: { props: { def: { name: 'booleanProp', type: 'boolean', target: 'inline:boolean' } } },
      I: { props: { def: { name: 'nullProp', type: 'null | number', target: 'inline:null' } } },
      K: {
        props: { def: { name: 'undefinedProp?', type: 'string', target: 'inline:undefined' } },
      },
    },
  },

  'ns:foo.enum': {
    ns: { type: { typename: 'Enum' } },
    columns: {
      A: { props: { def: { name: 'single?', type: '"hello"' } } },
      B: { props: { def: { name: 'union', type: '"red" | "green" | "blue"[]' } } },
      C: { props: { def: { name: 'array', type: '("red" | "green" | "blue")[]' } } },
    },
  },

  'ns:foo.messages': {
    ns: { type: { typename: 'MyMessages' } },
    columns: {
      A: { props: { def: { name: 'channel', type: 'string' } } },
      B: { props: { def: { name: 'color?', type: 'ns:foo.color', target: 'ref' } } },
      C: { props: { def: { name: 'messages', type: 'ns:foo.message[]', target: 'ref' } } },
    },
  },

  'ns:foo.message': {
    ns: { type: { typename: 'MyMessage' } },
    columns: {
      A: { props: { def: { name: 'date', type: 'number', default: -1 } } },
      B: { props: { def: { name: 'user', type: 'string', default: 'anon' } } },
      C: { props: { def: { name: 'message', type: 'string' } } },
    },
  },

  'ns:foo.nested': {
    ns: { type: { typename: 'MyNested' } },
    columns: {
      A: { props: { def: { name: 'one', type: '(string)' } } },
      B: { props: { def: { name: 'two', type: 'string | ("red" | boolean | "blue")' } } },
      C: { props: { def: { name: 'three', type: 'boolean | (ns:foo.color | string)' } } },
    },
  },

  'ns:foo.defaults': {
    ns: { type: { typename: 'MyDefaults' } },
    columns: {
      A: { props: { def: { name: 'title', type: 'string', default: 'Untitled' } } },
      B: {
        props: { def: { name: 'foo', type: 'string', default: { ref: 'cell:foo.sample:A1' } } },
      },
    },
  },
};
