import { t } from '../common';

type D = t.ITypeDefPayload;
export type SampleTypeDefs = {
  'ns:foo.multi': D;
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
  'ns:foo.multi': {
    columns: {
      A: { props: { def: { prop: 'MyOne.title', type: 'string' } } },
      B: {
        props: {
          def: [
            { prop: 'MyOne.foo', type: 'string', target: 'inline:foo', default: 'foo-default' },
            { prop: 'MyTwo.bar', type: 'string', target: 'inline:bar', default: 'bar-default' }, // NB: two distinct types represented on the same cell.
          ],
        },
      },
      C: { props: { def: { prop: 'MyTwo.name', type: 'string' } } },
    },
  },

  'ns:foo': {
    columns: {
      A: {
        props: {
          def: { prop: 'MyRow.title', type: 'string', default: 'Untitled' },
        },
      },
      B: {
        props: {
          def: { prop: 'MyRow.isEnabled', type: 'boolean | null', target: 'inline:isEnabled' },
        },
      },
      C: {
        props: {
          def: { prop: 'MyRow.color?', type: 'ns:foo.color/MyColor', target: 'inline:color' },
        },
      },
      D: {
        props: {
          def: { prop: 'MyRow.message', type: 'ns:foo.message/MyMessage | null', target: 'ref' },
        },
      },
      E: {
        props: {
          def: { prop: 'MyRow.messages', type: 'ns:foo.message/MyMessage[]', target: 'ref' },
        },
      },
    },
  },

  'ns:foo.color': {
    columns: {
      A: { props: { def: { prop: 'MyColor.label', type: 'string' } } },
      B: { props: { def: { prop: 'MyColor.color', type: '"red" | "green" | "blue"' } } },
      C: { props: { def: { prop: 'MyColor.description?', type: 'string' } } },
    },
  },

  'ns:foo.primitives': {
    columns: {
      A: {
        props: {
          def: {
            prop: 'Primitives.stringValue',
            type: 'string',
            default: { value: 'Hello (Default)' },
          },
        },
      },
      B: { props: { def: { prop: 'Primitives.numberValue', type: 'number', default: 999 } } },
      C: { props: { def: { prop: 'Primitives.booleanValue', type: 'boolean', default: true } } },
      D: {
        props: {
          def: { prop: 'Primitives.nullValue', type: 'null | string | number', default: null },
        },
      },
      E: { props: { def: { prop: 'Primitives.undefinedValue?', type: 'string' } } },
      F: {
        props: { def: { prop: 'Primitives.stringProp', type: 'string', target: 'inline:string' } },
      },
      G: {
        props: { def: { prop: 'Primitives.numberProp', type: 'number', target: 'inline:number' } },
      },
      H: {
        props: {
          def: { prop: 'Primitives.booleanProp', type: 'boolean', target: 'inline:boolean' },
        },
      },
      I: {
        props: {
          def: { prop: 'Primitives.nullProp', type: 'null | number', target: 'inline:null' },
        },
      },
      K: {
        props: {
          def: { prop: 'Primitives.undefinedProp?', type: 'string', target: 'inline:undefined' },
        },
      },
    },
  },

  'ns:foo.enum': {
    columns: {
      A: { props: { def: { prop: 'Enum.single?', type: '"hello"' } } },
      B: { props: { def: { prop: 'Enum.union', type: '"red" | "green" | "blue"[]' } } },
      C: { props: { def: { prop: 'Enum.array', type: '("red" | "green" | "blue")[]' } } },
    },
  },

  'ns:foo.messages': {
    ns: { type: {} },
    columns: {
      A: { props: { def: { prop: 'MyMessages.channel', type: 'string' } } },
      B: {
        props: { def: { prop: 'MyMessages.color?', type: 'ns:foo.color/MyColor', target: 'ref' } },
      },
      C: {
        props: {
          def: { prop: 'MyMessages.messages', type: 'ns:foo.message/MyMessage[]', target: 'ref' },
        },
      },
    },
  },

  'ns:foo.message': {
    columns: {
      A: { props: { def: { prop: 'MyMessage.date', type: 'number', default: -1 } } },
      B: { props: { def: { prop: 'MyMessage.user', type: 'string', default: 'anon' } } },
      C: { props: { def: { prop: 'MyMessage.message', type: 'string' } } },
    },
  },

  'ns:foo.nested': {
    columns: {
      A: { props: { def: { prop: 'MyNested.one', type: '(string)' } } },
      B: { props: { def: { prop: 'MyNested.two', type: 'string | ("red" | boolean | "blue")' } } },
      C: {
        props: {
          def: { prop: 'MyNested.three', type: 'boolean | (ns:foo.color/MyColor | string)' },
        },
      },
    },
  },

  'ns:foo.defaults': {
    columns: {
      A: { props: { def: { prop: 'MyDefault.title', type: 'string', default: 'Untitled' } } },
      B: {
        props: {
          def: { prop: 'MyDefault.foo', type: 'string', default: { ref: 'cell:foo.sample:A1' } },
        },
      },
    },
  },
};
