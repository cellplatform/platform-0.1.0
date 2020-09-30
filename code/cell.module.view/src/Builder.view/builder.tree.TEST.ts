import { expect, create, TestModule } from '../test';
import { Builder } from '..';

const test = () => {
  const { module: parent, bus } = create.testModule();
  const module = create.testModule(bus).module;
  const builder = Builder.tree.node(module, parent);
  return { builder, parent, module, bus };
};

const tree = (module: TestModule) => module.state.props?.treeview || {};

describe('Builder.tree.node', () => {
  it('parent', () => {
    const { parent, builder } = test();
    expect(builder.parent()).to.equal(parent);
  });

  it('label', () => {
    const { builder, module } = test();
    builder.label('one').label(' two ');
    expect(tree(module).label).to.eql('two');
  });
});
