import * as React from 'react';

import { ActionsFactory, Model } from '.';
import { ActionPanelProps } from '../../components/ActionPanel';
import { DevDefs, DisplayDefs } from '../../defs';
import { DEFAULT, expect, is, rx, StateObject, t, toObject } from '../../test';

type Ctx = { count: number };

function create() {
  type M = t.DevMethods<Ctx> & t.DisplayMethods<Ctx>;
  const defs = [...DevDefs, ...DisplayDefs];

  const model = ActionsFactory.model<Ctx>();
  const actions = ActionsFactory.compose<Ctx, M>(defs, model);
  const bus = rx.bus();
  return { model, actions, bus };
}

describe.only('Actions / Model', () => {
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
