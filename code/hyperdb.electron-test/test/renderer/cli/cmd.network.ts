import { Command } from '../common';
import * as t from './types';

type P = t.ICommandProps;

/**
 * [network] and global config values.
 */
export const network = Command.create<P>('network')
  .add('connect', async e => {
    const { network } = e.props;
    if (network) {
      await network.connect();
    }
  })
  .add('disconnect', async e => {
    const { network } = e.props;
    if (network) {
      await network.disconnect();
    }
  })
  .add('reconnect', async e => {
    const { network } = e.props;
    if (network) {
      await network.reconnect();
    }
  });
