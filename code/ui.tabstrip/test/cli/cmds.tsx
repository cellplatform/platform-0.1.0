import { Command, t } from '../common';

type P = t.ICommandProps & { count: number };

/**
 * Sample commands.
 */
export const root = Command.create<P>('root', e => {
  // Setup initial screen.
})
  .add('draggable', e => {
    e.props.state$.next({ isDraggable: true });
  })
  .add('not-draggable', e => {
    e.props.state$.next({ isDraggable: false });
  });
