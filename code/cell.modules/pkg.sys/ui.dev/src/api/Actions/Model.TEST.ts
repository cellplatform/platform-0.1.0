import { Model } from '.';
import { expect } from '../../test';
import { create } from './ActionsFactory.TEST';

describe('Actions / Model', () => {
  it('Model.state', () => {
    const { actions, model } = create();
    expect(Model.state(actions)).to.equal(model.state);
    expect(Model.state(actions.toModel())).to.equal(model.state);
    expect(Model.state(actions.toModel().state)).to.equal(model.state);
  });

  it('Model.item (id)', () => {
    const { actions, model } = create();
    actions.items((e) => e.button('foo'));
    const button = model.state.items[0];

    const res1 = Model.item(actions, 0);
    const res2 = Model.item(actions, button.id);
    const res3 = Model.item(actions, 'foobar');

    expect(res1.index).to.eql(0);
    expect(res1.item).to.eql(button);

    expect(res2.index).to.eql(0);
    expect(res2.item).to.eql(button);

    expect(res3.index).to.eql(-1);
    expect(res3.item).to.eql(undefined);
  });
});
