import { expect, DEFAULT } from '../test';
import { Filesystem } from '.';
import { nodefs, rx } from './common';

describe('Filesystem (node-js)', () => {
  const bus = rx.bus();

  describe('controller', () => {
    it('create: minimal arguments', () => {
      const root = nodefs.resolve('tmp/node'); // NB: root dir
      const controller = Filesystem.Controller({ bus, driver: root });

      expect(controller.dir).to.eql(root); // NB: root dir
      expect(controller.id).to.eql(DEFAULT.FILESYSTEM_ID);
    });
  });
});
