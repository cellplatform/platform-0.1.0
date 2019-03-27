import { Command, t } from '../common';

type P = t.ITestCommandProps;

const text = Command
  // <Text>
  .create<P>('text', e => e.props.state$.next({ view: 'text' }));

const input = Command
  // <TextInput>
  .create<P>('input', e => e.props.state$.next({ view: 'input' }));

/**
 * The root of the CLI application.
 */
export const root = Command.create<P>('root')
  .add(text)
  .add(input);
