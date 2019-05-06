import { Command, t, constants, COLORS } from '../common';

const { URL } = constants;
type P = t.ICommandProps;

/**
 * The root of the CLI application.
 */
export const root = Command.create<P>('root')
  .add('src', e => {
    const param = e.param(0);
    const src = typeof param === 'string' ? param : (URL[`WOMAN_${param}`] as string);
    e.props.state$.next({ src });
  })
  .add('size', e => {
    const size = e.param<number>(0);
    e.props.state$.next({ size });
  })
  .add('borderRadius', e => {
    const borderRadius = e.param<number>(0);
    e.props.state$.next({ borderRadius });
  })
  .add('borderColor', e => {
    const borderColor = e.param<number | string>(0);
    e.props.state$.next({ borderColor });
  })
  .add('borderWidth', e => {
    const borderWidth = e.args.params[0] as number;
    e.props.state$.next({ borderWidth });
  })
  .add('backgroundColor', e => {
    let color = e.param<string>(0);
    color = (color || '').toLowerCase() === 'blue' ? COLORS.BLUE : color;
    e.props.state$.next({ backgroundColor: color });
  })
  .add('placeholderIconColor', e => {
    let color = e.param<string>(0);
    color = (color || '').toLowerCase() === 'white' ? COLORS.WHITE : color;
    e.props.state$.next({ placeholderIconColor: color });
  });
