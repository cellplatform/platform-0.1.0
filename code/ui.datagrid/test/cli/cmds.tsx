import { Command, t } from '../common';

type P = t.ITestCommandProps;

/**
 * The root of the CLI application.
 */
export const root = Command.create<P>('root')
  //
  .add('editor', e => e.props.state$.next({ editor: e.args.params[0] as t.TestEditorType }));
