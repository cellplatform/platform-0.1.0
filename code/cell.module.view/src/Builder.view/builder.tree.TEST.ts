import { expect, create, TestModule } from '../test';
import { Builder } from '..';

const createTest = () => {
  const { module: parent, bus } = create.testModule();
  const module = create.testModule(bus).module as any;
  const builder = Builder.tree.node(module, parent);
  return { builder, parent, module, bus };
};

const state = (module: TestModule) => module.state.props?.treeview || {};

describe('Builder.tree.node', () => {
  it(':parent', () => {
    const { parent, builder } = createTest();
    expect(builder.parent()).to.equal(parent);
  });

  it('label', () => {
    const { builder, module } = createTest();
    const test = (value: any, expected: any) => {
      builder.label(value);
      expect(state(module).label).to.eql(expected);
    };

    test('one', 'one');
    test(' foo ', 'foo');

    test('  ', undefined);
    test('', undefined);
    test(undefined, undefined);
    test(null, undefined);
    test({}, undefined);
  });

  it('icon', () => {
    const { builder, module } = createTest();
    const test = (value: any, expected: any) => {
      builder.icon(value);
      expect(state(module).icon).to.eql(expected);
    };

    test('Face', 'Face');
    test(null, null);
    test('', undefined);
    test(' ', undefined);
    test(undefined, undefined);
  });

  it('title', () => {
    const { builder, module } = createTest();
    const test = (value: any, expected: any) => {
      builder.title(value);
      expect(state(module).title).to.eql(expected);
    };

    test('one', 'one');
    test(' foo ', 'foo');

    test('  ', undefined);
    test('', undefined);
    test(undefined, undefined);
    test(null, undefined);
    test({}, undefined);
  });

  it('description', () => {
    const { builder, module } = createTest();
    const test = (value: any, expected: any) => {
      builder.description(value);
      expect(state(module).description).to.eql(expected);
    };

    test('one', 'one');
    test(' foo ', 'foo');

    test('  ', undefined);
    test('', undefined);
    test(undefined, undefined);
    test(null, undefined);
    test({}, undefined);
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
    const test = (value: any, expected: any) => {
      builder.isVisible(value);
      expect(state(module).isVisible).to.eql(expected);
    };
    test(true, true);
    test(false, false);
    test({}, undefined);
  });

  it('isBold', () => {
    const { builder, module } = createTest();
    const test = (value: any, expected: any) => {
      builder.isBold(value);
      expect(state(module).isBold).to.eql(expected);
    };
    test(true, true);
    test(false, false);
    test({}, undefined);
  });

  it('isSpinning', () => {
    const { builder, module } = createTest();
    const test = (value: any, expected: any) => {
      builder.isSpinning(value);
      expect(state(module).isSpinning).to.eql(expected);
    };
    test(true, true);
    test(false, false);
    test({}, undefined);
  });

  describe('header', () => {
    it(':parent', () => {
      const { builder } = createTest();
      expect(builder.header.parent()).to.equal(builder);
    });

    it('isVisible', () => {
      const { builder, module } = createTest();
      const test = (value: any, expected: any) => {
        builder.header.isVisible(value);
        expect(state(module).header?.isVisible).to.eql(expected);
      };
      test(true, true);
      test(false, false);
      test(undefined, undefined);
      test({}, undefined);
    });

    it('parentButton', () => {
      const { builder, module } = createTest();
      const test = (value: any, expected: any) => {
        builder.header.parentButton(value);
        expect(state(module).header?.showParentButton).to.eql(expected);
      };
      test(true, true);
      test(false, false);
      test(undefined, undefined);
      test({}, undefined);
    });

    it('marginBottom', () => {
      const { builder, module } = createTest();
      const test = (value: any, expected: any) => {
        builder.header.marginBottom(value);
        expect(state(module).header?.marginBottom).to.eql(expected);
      };
      test(10, 10);
      test(undefined, undefined);
      test(-99, 0);
      test({}, undefined);
    });

    it('height', () => {
      const { builder, module } = createTest();
      const test = (value: any, expected: any) => {
        builder.header.height(value);
        expect(state(module).header?.height).to.eql(expected);
      };
      test(10, 10);
      test(undefined, undefined);
      test(-99, 0);
      test({}, undefined);
    });
  });

  describe('inline', () => {
    it(':parent', () => {
      const { builder } = createTest();
      expect(builder.inline.parent()).to.equal(builder);
    });

    it('isVisible', () => {
      const { builder, module } = createTest();
      const test = (value: any, expected: any) => {
        builder.inline.isVisible(value);
        expect(state(module).inline?.isVisible).to.eql(expected);
      };
      test(true, true);
      test(false, false);
      test(undefined, undefined);
      test({}, undefined);
    });

    it('isOpen', () => {
      const { builder, module } = createTest();
      const test = (value: any, expected: any) => {
        builder.inline.isOpen(value);
        expect(state(module).inline?.isOpen).to.eql(expected);
      };
      test(true, true);
      test(false, false);
      test(undefined, undefined);
      test({}, undefined);
    });
  });

  describe('chevron', () => {
    it(':parent', () => {
      const { builder } = createTest();
      expect(builder.chevron.parent()).to.equal(builder);
    });

    it('isVisible', () => {
      const { builder, module } = createTest();
      const test = (value: any, expected: any) => {
        builder.chevron.isVisible(value);
        expect(state(module).chevron?.isVisible).to.eql(expected);
      };
      test(true, true);
      test(false, false);
      test(undefined, undefined);
      test({}, undefined);
    });
  });
});
