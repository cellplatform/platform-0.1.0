import { t } from '../common';

type D = t.ITypeDefPayload;
export type SampleTypeDefs = {
  'ns:foo': D;
  'ns:foo.color': D;
  'ns:foo.message': D;
  'ns:foo.messages': D;
  'ns:foo.nested': D;
};

export const TYPE_DEFS: SampleTypeDefs = {
  'ns:foo': {
    ns: { type: { typename: 'MyRow' } },
    columns: {
      A: { props: { prop: { name: 'title', type: 'string' } } },
      B: { props: { prop: { name: 'isEnabled', type: 'boolean', target: 'inline:isEnabled' } } },
      C: {
        props: { prop: { name: 'color?', type: 'ns:foo.color', target: 'inline:color' } },
      },
    },
  },

  'ns:foo.color': {
    ns: { type: { typename: 'MyColor' } },
    columns: {
      A: { props: { prop: { name: 'label', type: 'string' } } },
      B: { props: { prop: { name: 'color', type: '"red" | "green" | "blue"' } } },
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

  'ns:foo.messages': {
    ns: { type: { typename: 'MyMessages' } },
    columns: {
      A: { props: { prop: { name: 'channel', type: 'string' } } },
      B: { props: { prop: { name: 'messages', type: 'ns:foo.message[]' } } },
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
