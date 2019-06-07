import { Command, t } from '../common';

type P = t.ICommandProps;

/**
 * Sample commands.
 */
export const root = Command.create<P>('root', e => {
  // Setup initial screen.
})
  .add('DARK', e => {
    e.props.state$.next({ theme: 'DARK' });
  })
  .add('LIGHT', e => {
    e.props.state$.next({ theme: 'LIGHT' });
  })
  .add('data-object', e => {
    function myFunc() {
      return true;
    }

    const data = {
      message: 'Hello',
      reallyLongKeyNameTooLongInFact: 'foo',
      count: 123,
      foo: { isEnabled: true, color: 'PINK' },
      list: [1, 2, 3],
      anon: () => true,
      run: myFunc,
      isEnabled: true,
    };
    e.props.next({ data });
  })
  .add('data-array', e => {
    const data = [1, 2, 3];
    e.props.next({ data });
  });
