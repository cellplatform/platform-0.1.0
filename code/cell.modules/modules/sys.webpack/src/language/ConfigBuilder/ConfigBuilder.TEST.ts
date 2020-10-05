import { expect, rx, t, constants } from '../../test';
import { WebpackBuilders } from '..';
import { Webpack } from '../..';

const props = (m: t.WebpackModule) => m.state.props as t.WebpackProps;
const data = (m: t.WebpackModule) => props(m).data as t.WebpackData;
const configAt = (m: t.WebpackModule, index: number) => data(m).configs[index];

const create = () => {
  const bus = rx.bus();
  const module = Webpack.module(bus);
  const config = WebpackBuilders.config(bus, module);
  return { bus, module, config };
};

describe('Webpack: ConfigBuilder', () => {
  it('create config (by "name")', () => {
    const { module, config } = create();

    expect(data(module)).to.eql(constants.DEFAULT.DATA);
    expect(configAt(module, 0)?.name).to.eql(undefined);

    const foo = config.name('dev');
    expect(config.name('dev')).to.equal(foo); // NB: Same instance.
    expect(configAt(module, 0).name).to.eql('dev'); // NB: Name auto assigned.
  });

  describe.only('config', () => {
    it('config: name', () => {
      const { module, config } = create();

      const foo = config.name('dev');
      expect(configAt(module, 0).name).to.eql('dev');

      foo.name('hello');
      expect(configAt(module, 0).name).to.eql('hello');

      foo.name('boo').name('  zoo  ');
      expect(configAt(module, 0).name).to.eql('zoo'); // NB: trimmed.

      const zoo = foo.name('zoo');
      expect(zoo).to.not.eql(undefined);
      expect(zoo).to.eql(foo.name('zoo'));
    });
  });
});
