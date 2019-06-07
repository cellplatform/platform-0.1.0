import { Command, t } from '../common';

type P = t.ICommandProps;

function myFunc() {
  return true;
}

export const SAMPLE = {
  message: 'Hello',
  reallyLongKey: 'foo',
  count: 123,
  foo: { isEnabled: true, color: 'PINK' },
  list: ['one', 2, true, { foo: 456 }],
  anon: () => true,
  run: myFunc,
  isEnabled: true,
};

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
    e.props.next({ data: { ...SAMPLE } });
  })
  .add('data-array', e => {
    const data = [1, 'two', { ...SAMPLE }, () => true, myFunc, true, false];
    e.props.next({ data });
  });
