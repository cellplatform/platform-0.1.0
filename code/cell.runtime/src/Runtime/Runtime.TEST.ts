import { Runtime } from '.';
import { expect, t } from '../test';

const __CELL__: t.RuntimeModule = {
  module: { name: 'my-module', version: '1.2.3' },
};

describe('Runtime', () => {
  describe('Module', () => {
    it('from <nothing>', () => {
      const module = Runtime.module();
      expect(module.name).to.eql('');
      expect(module.version).to.eql('');
    });

    it('from __CELL__', () => {
      const module = Runtime.module(__CELL__);
      expect(module.name).to.eql('my-module');
      expect(module.version).to.eql('1.2.3');
    });
  });
});
