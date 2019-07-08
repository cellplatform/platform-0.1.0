import { Command, t } from '../common';

type P = t.ICommandProps;

function myFunc() {
  return true;
}

export const OBJECT = {
  message: 'Hello',
  reallyLongKey: 'foo',
  count: 123,
  foo: { isEnabled: true, color: 'PINK', isFiltered: 'WILL NOT SHOW', hide: true },
  list: ['one', 2, true, { foo: 456 }],
  anon: () => true,
  run: myFunc,
  isEnabled: true,
  custom: { foo: 123 },
  'custom-props': 42,
  isFiltered: 'WILL NOT SHOW',
};

export const ARRAY = [
  1,
  'two',
  { ...OBJECT },
  () => true,
  myFunc,
  true,
  false,
  [1, 2, 3, ['hello', 'goodby', true, OBJECT]],
];

/**
 * Sample commands.
 */
export const root = Command.create<P>('root')
  .add('DARK', e => {
    e.props.state$.next({ theme: 'DARK' });
  })
  .add('LIGHT', e => {
    e.props.state$.next({ theme: 'LIGHT' });
  })
  .add('object', e => {
    e.props.next({ data: { ...OBJECT } });
  })
  .add('array', e => {
    const data = [...ARRAY];
    e.props.next({ data });
  })
  .add('is-insertable', e => {
    e.props.next({ isInsertable: true });
  })
  .add('not-insertable', e => {
    e.props.next({ isInsertable: false });
  });
