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
  });
