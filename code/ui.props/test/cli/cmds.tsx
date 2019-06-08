import { Command, t } from '../common';

type P = t.ICommandProps;

function myFunc() {
  return true;
}

export const OBJECT = {
  message: 'Hello',
  reallyLongKey: 'foo',
  count: 123,
  foo: { isEnabled: true, color: 'PINK' },
  list: ['one', 2, true, { foo: 456 }],
  anon: () => true,
  run: myFunc,
  isEnabled: true,
  custom: { foo: 123 },
  'custom-props': 42,
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
  .add('data-object', e => {
    e.props.next({ data: { ...OBJECT } });
  })
  .add('data-array', e => {
    const data = [...ARRAY];
    e.props.next({ data });
  });
