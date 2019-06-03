import { Command, t } from '../common';

type P = t.ICommandProps;

/**
 * Sample commands.
 */
export const root = Command.create<P>('root', e => {
  // Setup initial screen.
})
  .add('bundle', e => {
    e.props.ipc.send<t.IBundleEvent>('ELECTRON/bundle', {
      source: {
        main: './.uiharness/bundle/app.main',
        renderer: './.uiharness/bundle/app.renderer/prod',
      },
      target: './tmp/bundle',
    });
  })
  .add('download', e => {
    e.props.ipc.send('ELECTRON/download', {});
  });
