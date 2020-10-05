import { expect, rx, t, constants } from '../../test';
import { Webpack } from '../..';

const props = (m: t.WebpackModule) => m.state.props as t.WebpackProps;
const data = (m: t.WebpackModule) => props(m).data as t.WebpackData;
const configAt = (m: t.WebpackModule, index: number) => data(m).configs[index];

const create = () => {
  const bus = rx.bus();
  const module = Webpack.module(bus);
  const builder = Webpack.builder.config(bus, module);
  return { bus, module, builder };
};

describe.only('Webpack: ConfigBuilder', () => {
  describe('create', () => {
    it('by "name"', () => {
      const { module, builder } = create();
      const dev = builder.name('dev');
      expect(builder.name('dev')).to.equal(dev); // NB: Same instance.
      expect(configAt(module, 0).name).to.eql('dev'); // NB: Name auto assigned.
    });

    it('default values', () => {
      const { module, builder } = create();
      expect(data(module)).to.eql(constants.DEFAULT.DATA);
      builder.name('foo');

      const config = configAt(module, 0);
      expect(config).to.eql({ ...constants.DEFAULT.CONFIG, name: 'foo' });
    });
  });

  describe('config', () => {
    it('name', () => {
      const { module, builder } = create();

      const foo = builder.name('dev');
      expect(configAt(module, 0).name).to.eql('dev');

      foo.name('hello');
      expect(configAt(module, 0).name).to.eql('hello');

      foo.name('boo').name('  zoo  ');
      expect(configAt(module, 0).name).to.eql('zoo'); // NB: trimmed.

      const zoo = foo.name('zoo');
      expect(zoo).to.not.eql(undefined);
      expect(zoo).to.eql(foo.name('zoo'));
    });

    it('mode', () => {
      const { module, builder } = create();

      const test = (input: any, expected: t.WebpackMode) => {
        builder.name('foo').mode(input);
        expect(configAt(module, 0).mode).to.eql(expected);
      };

      test(undefined, 'production');
      test('', 'production');
      test('  ', 'production');
      test({}, 'production');
      test(123, 'production');

      test('production', 'production');
      test(' production  ', 'production');
      test('prod', 'production');
      test(' prod ', 'production');

      test('development', 'development');
      test(' dev ', 'development');
    });

    it('mode: throw', () => {
      const { builder } = create();
      const fn = () => builder.name('foo').mode('foo' as any);
      expect(fn).to.throw(/Invalid mode/);
    });
  });
});
