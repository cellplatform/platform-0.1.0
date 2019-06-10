import { Command, t } from '../common';

type P = t.ICommandProps & { count: number };

/**
 * Sample commands.
 */
export const root = Command.create<P>('root', e => {
  // Setup initial screen.
})
  .add('title', e => {
    const title = e.param(0, 'Untitled');
    e.props.state$.next({ title });
  })

  .add('increment', e => {
    const count = e.get('count', 0) + 1;
    e.set('count', count);
    e.props.state$.next({ count });
  })
  .add('decrement', e => {
    const count = e.get('count', 0) - 1;
    e.set('count', count);
    e.props.state$.next({ count });
  });
