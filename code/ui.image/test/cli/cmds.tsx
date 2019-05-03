import { Command, t, constants } from '../common';

const { URL } = constants;

type P = t.ICommandProps;

/**
 * The root of the CLI application.
 */
export const root = Command.create<P>('root')
  .add('src-woman-1', e => {
    e.props.state$.next({ src: URL.WOMAN_1 });
  })
  .add('src-woman-2', e => {
    e.props.state$.next({ src: URL.WOMAN_2 });
  })
  .add('size', e => {
    const size = e.args.params[0] as number;
    e.props.state$.next({ size });
  })
  .add('borderRadius', e => {
    const borderRadius = e.args.params[0] as number;
    e.props.state$.next({ borderRadius });
  })
  .add('borderColor', e => {
    const borderColor = e.args.params[0] as number | string;
    e.props.state$.next({ borderColor });
  })
  .add('borderWidth', e => {
    const borderWidth = e.args.params[0] as number;
    e.props.state$.next({ borderWidth });
  });
