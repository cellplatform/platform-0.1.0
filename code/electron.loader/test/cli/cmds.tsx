import { Command, t } from '../common';

type P = t.ICommandProps;

/**
 * Sample commands.
 */
export const root = Command.create<P>('root', e => {
  // Setup initial screen.
})
  // .add('download', e => {
  //   e.props.ipc.send('ELECTRON_LOADER/download', { version: '0.0.1' });
  //   e.props.ipc.send('ELECTRON_LOADER/download', { version: '0.0.2' });
  // })
  .add('open-1', e => {
    e.props.ipc.send<t.IOpenWindowEvent>('ELECTRON_LOADER/open', {
      version: '0.0.1',
      html: 'electron.test.renderer.one.html',
    });
  })
  .add('open-2', e => {
    e.props.ipc.send<t.IOpenWindowEvent>('ELECTRON_LOADER/open', {
      version: '0.0.2',
      html: 'electron.test.renderer.one.html',
    });
  });
