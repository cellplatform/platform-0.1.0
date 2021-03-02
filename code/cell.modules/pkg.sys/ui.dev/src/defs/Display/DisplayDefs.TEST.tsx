import { ActionsFactory } from '../..';
import { DevDefs, DisplayDefs } from '../../defs';
import { expect, rx, t } from '../../test';

type Ctx = { count: number };

export function create() {
  type M = t.DevMethods<Ctx> & t.DisplayMethods<Ctx>;
  const defs = [...DevDefs, ...DisplayDefs];
  const model = ActionsFactory.model<Ctx>();
  const actions = ActionsFactory.compose<Ctx, M>(defs, model);
  const bus = rx.bus();
  return { model, actions, bus };
}

describe('Display', () => {
  describe('hr', () => {
    it('param: none', () => {
      const { actions, model } = create();
      expect(model.state.items).to.eql([]);

      actions.items((e) => e.hr());

      const items = model.state.items;
      expect(items.length).to.eql(1);

      const item = items[0] as t.ActionHr;
      expect(item.kind).to.eql('display/hr');
      expect(item.height).to.eql(8);
      expect(item.opacity).to.eql(0.06);
      expect(item.margin).to.eql([8, 8]);
    });

    it('param: fn', () => {
      const { actions, model } = create();
      expect(model.state.items).to.eql([]);

      actions.items((e) => e.hr((config) => config.height(1).opacity(0.3)));

      const items = model.state.items;
      expect(items.length).to.eql(1);

      const item = items[0] as t.ActionHr;
      expect(item.kind).to.eql('display/hr');
      expect(item.height).to.eql(1);
      expect(item.opacity).to.eql(0.3);
    });

    it('params: number (height, opacity, margin)', () => {
      const { actions, model } = create();

      actions.items((e) => e.hr().hr(3).hr(1, 0.2, [10, 20, 30, 40]));

      type H = t.ActionHr;
      const items = model.state.items;
      const item1 = items[0] as H;
      const item2 = items[1] as H;
      const item3 = items[2] as H;

      expect(item1.height).to.eql(8);
      expect(item2.height).to.eql(3);
      expect(item3.height).to.eql(1);

      expect(item1.opacity).to.eql(0.06);
      expect(item2.opacity).to.eql(0.06);
      expect(item3.opacity).to.eql(0.2);

      expect(item1.margin).to.eql([8, 8]);
      expect(item2.margin).to.eql([8, 8]);
      expect(item3.margin).to.eql([10, 20, 30, 40]);
    });

    it('min-height: 0', () => {
      const { actions, model } = create();
      actions.items((e) => e.hr().hr((config) => config.height(-1)));

      type H = t.ActionHr;
      const items = model.state.items;
      const item1 = items[0] as H;
      const item2 = items[1] as H;

      expect(item1.height).to.eql(8); // NB: default
      expect(item2.height).to.eql(0);
    });

    it('opacity: clamp 0..1', () => {
      const { actions, model } = create();

      actions.items((e) =>
        e
          .hr()
          .hr((config) => config.opacity(99))
          .hr((config) => config.opacity(-1)),
      );

      type H = t.ActionHr;
      const items = model.state.items;
      const item1 = items[0] as H;
      const item2 = items[1] as H;
      const item3 = items[2] as H;

      expect(item1.opacity).to.eql(0.06); // NB: default.
      expect(item2.opacity).to.eql(1);
      expect(item3.opacity).to.eql(0);
    });

    it('margin: 0', () => {
      const { actions, model } = create();
      actions.items((e) =>
        e
          .hr((config) => config.margin(1))
          .hr((config) => config.margin([5, 10]))
          .hr((config) => config.margin([1, 2, 3, 4])),
      );
      type H = t.ActionHr;
      const items = model.state.items;
      const item1 = items[0] as H;
      const item2 = items[1] as H;
      const item3 = items[2] as H;

      expect(item1.margin).to.eql(1); // NB: default
      expect(item2.margin).to.eql([5, 10]);
      expect(item3.margin).to.eql([1, 2, 3, 4]);
    });
  });

  describe('title', () => {
    it('string: Untitled', () => {
      const { actions, model } = create();
      expect(model.state.items).to.eql([]);

      actions.items((e) => e.title('  '));

      const items = model.state.items;
      expect(items.length).to.eql(1);

      const item = items[0] as t.ActionTitle;
      expect(item.kind).to.eql('display/title');
      expect(item.text).to.eql('Untitled');
    });

    it('string: "My Title"', () => {
      const { actions, model } = create();
      expect(model.state.items).to.eql([]);

      actions.items((e) => e.title('  My Title  '));

      const items = model.state.items;
      expect(items.length).to.eql(1);

      const item = items[0] as t.ActionTitle;
      expect(item.kind).to.eql('display/title');
      expect(item.text).to.eql('My Title');
    });

    it('config', () => {
      const { actions, model } = create();
      expect(model.state.items).to.eql([]);

      actions.items((e) => e.title((config) => config.text('  Hello  ')));

      const items = model.state.items;
      expect(items.length).to.eql(1);

      const item = items[0] as t.ActionTitle;
      expect(item.kind).to.eql('display/title');
      expect(item.text).to.eql('Hello');
    });

    it('string, config', () => {
      const { actions, model } = create();
      expect(model.state.items).to.eql([]);

      actions.items((e) => e.title('My Title', (config) => config.text('  Hello  ')));

      const items = model.state.items;
      expect(items.length).to.eql(1);

      const item = items[0] as t.ActionTitle;
      expect(item.kind).to.eql('display/title');
      expect(item.text).to.eql('Hello');
    });
  });
});
