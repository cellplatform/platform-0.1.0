import { expect } from 'chai';
import { CommandParam, ICommandParam } from '.';

describe('CommandParam', () => {
  it('minimal construction', () => {
    const param = CommandParam.create({ name: 'foo' });
    expect(param.name).to.eql('foo');
    expect(param.type).to.eql('string');
    expect(param.isEnum).to.eql(false);
  });

  it('throws if name not specified', () => {
    const fn = () => CommandParam.create({ name: '  ' });
    expect(fn).to.throw();
  });

  it('types (value)', () => {
    const test = (type: ICommandParam['type']) => {
      const param = CommandParam.create({ name: 'foo', type });
      expect(param.type).to.eql(type);
      expect(param.isEnum).to.eql(false);
    };
    test('boolean');
    test('number');
    test('string');
  });

  it('types (enum)', () => {
    const param = CommandParam.create({ name: 'foo', type: ['one', 1, true] });
    expect(param.type).to.eql(['one', 1, true]);
    expect(param.isEnum).to.eql(true);
  });
});
