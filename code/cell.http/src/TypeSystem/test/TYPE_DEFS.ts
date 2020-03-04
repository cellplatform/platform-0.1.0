import { t } from '../common';

export type SampleTypeDefs = { 'ns:foo': t.ITypeDefPayload; 'ns:foo.color': t.ITypeDefPayload };

export const TYPE_DEFS: SampleTypeDefs = {
  'ns:foo': {
    ns: {
      type: { typename: 'MyRow' },
    },
    columns: {
      A: { props: { prop: { name: 'title', type: 'string' } } },
      B: { props: { prop: { name: 'isEnabled', type: 'boolean', target: 'inline:isEnabled' } } },
      C: {
        props: { prop: { name: 'color?', type: 'ns:foo.color', target: 'inline:color' } },
      },
    },
  },

  'ns:foo.color': {
    ns: {
      type: { typename: 'MyColor' },
    },
    columns: {
      A: { props: { prop: { name: 'label', type: 'string' } } },
      B: { props: { prop: { name: 'color', type: '"red" | "green" | "blue"' } } },
    },
  },
};
