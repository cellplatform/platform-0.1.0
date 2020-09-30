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

  it('padding', () => {
    const { builder, module } = createTest();
    const test = (value: any, expected: any) => {
      builder.padding(value);
      expect(state(module).padding).to.eql(expected);
    };
    test(10, 10);
    test(undefined, undefined);
    test([1, 2, 3, 4], [1, 2, 3, 4]);
    test([1, 2, 3, 4, 5], [1, 2, 3, 4]);
    test([10, 5], [10, 5, 10, 5]); // NB: [vertical | horizontal] to [top, right, bottom left]
    test({}, undefined);
  });

  it('marginTop', () => {
    const { builder, module } = createTest();
    const test = (value: any, expected: any) => {
      builder.marginTop(value);
      expect(state(module).marginTop).to.eql(expected);
    };
    test(10, 10);
    test(undefined, undefined);
    test(-99, 0);
    test({}, undefined);
  });

  it('marginBottom', () => {
    const { builder, module } = createTest();
    const test = (value: any, expected: any) => {
      builder.marginBottom(value);
      expect(state(module).marginBottom).to.eql(expected);
    };
    test(10, 10);
    test(undefined, undefined);
    test(-99, 0);
    test({}, undefined);
  });

  it('isEnabled', () => {
    const { builder, module } = createTest();
    const test = (value: any, expected: boolean | undefined) => {
      builder.isEnabled(value);
      expect(state(module).isEnabled).to.eql(expected);
    };
    test(true, true);
    test(false, false);
    test({}, undefined);
  });

  it('isVisible', () => {
    const { builder, module } = createTest();
    const test = (value: any, expected: boolean | undefined) => {
      builder.isVisible(value);
      expect(state(module).isVisible).to.eql(expected);
    };
    test(true, true);
    test(false, false);
    test({}, undefined);
  });

  it('isBold', () => {
    const { builder, module } = createTest();
    const test = (value: any, expected: boolean | undefined) => {
      builder.isBold(value);
      expect(state(module).isBold).to.eql(expected);
    };
    test(true, true);
    test(false, false);
    test({}, undefined);
  });

  it('isSpinning', () => {
    const { builder, module } = createTest();
    const test = (value: any, expected: boolean | undefined) => {
      builder.isSpinning(value);
      expect(state(module).isSpinning).to.eql(expected);
    };
    test(true, true);
    test(false, false);
    test({}, undefined);
  });
});
