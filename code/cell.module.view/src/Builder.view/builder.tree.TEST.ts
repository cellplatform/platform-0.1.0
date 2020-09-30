import { expect, create, TestModule } from '../test';
import { Builder } from '..';

const createTest = () => {
  const { module: parent, bus } = create.testModule();
  const module = create.testModule(bus).module;
  const builder = Builder.tree.node(module, parent);
  return { builder, parent, module, bus };
};

const state = (module: TestModule) => module.state.props?.treeview || {};

describe.only('Builder.tree.node', () => {
  it('parent', () => {
    const { parent, builder } = createTest();
    expect(builder.parent()).to.equal(parent);
  });

  it('label', () => {
    const { builder, module } = createTest();
    const test = (value: any, expected: string) => {
      builder.label(value);
      expect(state(module).label).to.eql(expected);
    };

    test('one', 'one');
    test(' foo ', 'foo');

    test(undefined, '');
    test(null, '');
    test({}, '');
  });

  it('icon', () => {
    const { builder, module } = createTest();
    builder.icon('Face');
    expect(state(module).icon).to.eql('Face');

    builder.icon(null);
    expect(state(module).icon).to.eql(null);
  });

  it('title', () => {
    const { builder, module } = createTest();
    const test = (value: any, expected: string) => {
      builder.title(value);
      expect(state(module).title).to.eql(expected);
    };

    test('one', 'one');
    test(' foo ', 'foo');

    test(undefined, '');
    test(null, '');
    test({}, '');
  });

  it('description', () => {
    const { builder, module } = createTest();
    const test = (value: any, expected: string) => {
      builder.description(value);
      expect(state(module).description).to.eql(expected);
    };

    test('one', 'one');
    test(' foo ', 'foo');

    test(undefined, '');
    test(null, '');
    test({}, '');
  });

  it('opacity', () => {
    const { builder, module } = createTest();
    const test = (value: any, expected: number) => {
      builder.opacity(value);
      expect(state(module).opacity).to.eql(expected);
    };

    test(0, 0);
    test(0.123, 0.123);
    test(1, 1);

    test(-1, 0);
    test(99, 1);

    test(undefined, 1);
    test(null, 1);
    test({}, 1);
  });
});
