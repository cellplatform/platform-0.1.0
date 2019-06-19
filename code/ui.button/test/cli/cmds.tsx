import { Command, t, constants } from '../common';

type P = t.ICommandProps;

/**
 * The root of the CLI application.
 */
export const root = Command.create<P>('root')
  .add('enabled', e => {
    e.props.state$.next({ isEnabled: true });
  })
  .add('disabled', e => {
    e.props.state$.next({ isEnabled: false });
  })
  .add('checked', e => {
    e.props.state$.next({ isChecked: true });
  })
  .add('unchecked', e => {
    e.props.state$.next({ isChecked: false });
  });
