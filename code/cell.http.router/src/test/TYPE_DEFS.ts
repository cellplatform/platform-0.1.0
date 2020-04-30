import { t } from '../common';

type D = t.ITypeDefPayload;
export type SampleTypeDefs = {
  'ns:foo': D;
  'ns:foo.color': D;
  'ns:foo.messages': D;
  'ns:foo.message': D;
};

export const TYPE_DEFS: SampleTypeDefs = {
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
};
