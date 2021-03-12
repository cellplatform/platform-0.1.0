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

describe('Dev', () => {
  describe('button', () => {
    it('label, handler', () => {
      const { actions, model } = create();
      expect(model.state.items).to.eql([]);

      const fn1: t.ActionButtonHandler<any> = () => null;
      const fn2: t.ActionButtonHandler<any> = () => null;
      actions.items((e) => {
        e.button('  foo  ', fn1).button('bar', fn1).button('foo', fn2);
      });

      const items = model.state.items;
      expect(items.length).to.eql(3);

      const button1 = items[0] as t.ActionButton;
      const button2 = items[1] as t.ActionButton;
      const button3 = items[2] as t.ActionButton;

      expect(button1.kind).to.eql('dev/button');
      expect(button1.label).to.eql('foo');
      expect(button1.handlers).to.eql([fn1]);

      expect(button2.kind).to.eql('dev/button');
      expect(button2.label).to.eql('bar');
      expect(button2.handlers).to.eql([fn1]);

      expect(button3.kind).to.eql('dev/button');
      expect(button3.label).to.eql('foo');
      expect(button3.handlers).to.eql([fn2]);
    });

    it('label (no handler)', () => {
      const { actions, model } = create();

      actions.items((e) => e.button('foo'));

      const items = model.state.items;
      expect(items.length).to.eql(1);

      const button = items[0] as t.ActionButton;
      expect(button.label).to.eql('foo');
      expect(button.handlers).to.eql([]);
    });

    it('config', () => {
      const { actions, model } = create();
      expect(model.state.items).to.eql([]);

      const fn: t.ActionButtonHandler<any> = () => null;
      actions.items((e) => e.button((config) => config.label('foo').pipe(fn)));

      const items = model.state.items;
      expect(items.length).to.eql(1);
      expect(items[0].kind).to.eql('dev/button');

      const button = items[0] as t.ActionButton;
      expect(button.kind).to.eql('dev/button');
      expect(button.handlers).to.eql([fn]);
    });

    it('config: "Unnamed"', () => {
      const { actions, model } = create();
      expect(model.state.items).to.eql([]);

      actions.items((e) => e.button((config) => null));

      const items = model.state.items;
      const button = items[0] as t.ActionButton;
      expect(button.kind).to.eql('dev/button');
      expect(button.label).to.eql('Unnamed');
    });

    it('config: "Unnamed" (via empty value)', () => {
      const { actions, model } = create();
      expect(model.state.items).to.eql([]);

      actions.items((e) => e.button((config) => config.label('hello').label('  ')));

      const items = model.state.items;
      const button = items[0] as t.ActionButton;
      expect(button.kind).to.eql('dev/button');
      expect(button.label).to.eql('Unnamed');
    });

    it('config: description', () => {
      const { actions, model } = create();
      expect(model.state.items).to.eql([]);

      actions.items((e) =>
        e.button((config) => config.label('foo').description('   My description   ')),
      );

      const items = model.state.items;
      expect(items.length).to.eql(1);

      const button = items[0] as t.ActionButton;
      expect(button.kind).to.eql('dev/button');
      expect(button.description).to.eql('My description');
    });

    it('pipe multiple handlers', () => {
      const { actions, model } = create();

      const fn1: t.ActionButtonHandler<any> = () => null;
      const fn2: t.ActionButtonHandler<any> = () => null;

      actions.items((e) => e.button((config) => config.pipe(fn1, fn2, fn1)));

      const items = model.state.items;
      expect(items.length).to.eql(1);
      const button = items[0] as t.ActionButton;

      expect(button.handlers.length).to.eql(3);
      expect(button.handlers[0]).to.eql(fn1);
      expect(button.handlers[1]).to.eql(fn2);
      expect(button.handlers[2]).to.eql(fn1);
    });
  });

  describe('boolean', () => {
    it('label, handler', () => {
      const { actions, model } = create();
      expect(model.state.items).to.eql([]);

      const fn1: t.ActionBooleanHandler<any> = () => true;
      const fn2: t.ActionBooleanHandler<any> = () => false;
      actions.items((e) => {
        e.boolean('  foo  ', fn1);
        e.boolean('bar', fn1);
        e.boolean((config) => config.label('foo').pipe(fn2).description('a thing'));
      });

      const items = model.state.items;
      expect(items.length).to.eql(3);

      const button1 = items[0] as t.ActionBoolean;
      const button2 = items[1] as t.ActionBoolean;
      const button3 = items[2] as t.ActionBoolean;

      expect(button1.kind).to.eql('dev/boolean');
      expect(button1.label).to.eql('foo');
      expect(button1.description).to.eql(undefined);
      expect(button1.handlers).to.eql([fn1]);

      expect(button2.kind).to.eql('dev/boolean');
      expect(button2.label).to.eql('bar');
      expect(button2.description).to.eql(undefined);
      expect(button2.handlers).to.eql([fn1]);

      expect(button3.kind).to.eql('dev/boolean');
      expect(button3.label).to.eql('foo');
      expect(button3.description).to.eql('a thing');
      expect(button3.handlers).to.eql([fn2]);
    });

    it('label (no handler)', () => {
      const { actions, model } = create();
      actions.items((e) => e.boolean('foo'));

      const items = model.state.items;
      expect(items.length).to.eql(1);

      const button = items[0] as t.ActionBoolean;
      expect(button.label).to.eql('foo');
      expect(button.handlers).to.eql([]);
    });

    it('pipe multiple handlers', () => {
      const { actions, model } = create();

      const fn1: t.ActionBooleanHandler<any> = () => true;
      const fn2: t.ActionBooleanHandler<any> = () => false;

      actions.items((e) => e.boolean((config) => config.pipe(fn1, fn2, fn1)));

      const items = model.state.items;
      expect(items.length).to.eql(1);
      const button = items[0] as t.ActionBoolean;

      expect(button.handlers.length).to.eql(3);
      expect(button.handlers[0]).to.eql(fn1);
      expect(button.handlers[1]).to.eql(fn2);
      expect(button.handlers[2]).to.eql(fn1);
    });
  });

  describe('select', () => {
    it('label, handler', () => {
      const { actions, model } = create();
      expect(model.state.items).to.eql([]);

      const fn1: t.ActionSelectHandler<any> = () => true;
      const fn2: t.ActionSelectHandler<any> = () => false;
      actions.items((e) => {
        e.select((config) => config.label('  foo  ').pipe(fn1));
        e.select((config) =>
          config
            .label('bar')
            .items(['one', { label: 'two', value: 2 }])
            .initial(2)
            .multi(true)
            .clearable(true)
            .pipe(fn2)
            .description('a thing'),
        );
      });

      const items = model.state.items;
      expect(items.length).to.eql(2);

      const select1 = items[0] as t.ActionSelect;
      const select2 = items[1] as t.ActionSelect;

      expect(select1.kind).to.eql('dev/select');
      expect(select1.label).to.eql('foo');
      expect(select1.description).to.eql(undefined);
      expect(select1.items).to.eql([]);
      expect(select1.handlers).to.eql([fn1]);
      expect(select1.multi).to.eql(false);
      expect(select1.clearable).to.eql(false);

      expect(select2.kind).to.eql('dev/select');
      expect(select2.label).to.eql('bar');
      expect(select2.description).to.eql('a thing');
      expect(select2.items).to.eql(['one', { label: 'two', value: 2 }]);
      expect(select2.handlers).to.eql([fn2]);
      expect(select2.multi).to.eql(true);
      expect(select2.clearable).to.eql(true);
    });

    it('label (no handler)', () => {
      const { actions, model } = create();

      actions.items((e) => e.select((config) => config.label('foo')));

      const items = model.state.items;
      expect(items.length).to.eql(1);

      const button = items[0] as t.ActionSelect;
      expect(button.label).to.eql('foo');
      expect(button.handlers).to.eql([]);
    });

    it('pipe multiple handlers', () => {
      const { actions, model } = create();

      const fn1: t.ActionSelectHandler<any> = () => true;
      const fn2: t.ActionSelectHandler<any> = () => false;

      actions.items((e) => e.select((config) => config.pipe(fn1, fn2, fn1)));

      const items = model.state.items;
      expect(items.length).to.eql(1);
      const select = items[0] as t.ActionSelect;

      expect(select.handlers.length).to.eql(3);
      expect(select.handlers[0]).to.eql(fn1);
      expect(select.handlers[1]).to.eql(fn2);
      expect(select.handlers[2]).to.eql(fn1);
    });
  });

  describe('textbox', () => {
    it('label, handler', () => {
      const { actions, model } = create();
      expect(model.state.items).to.eql([]);

      const fn1: t.ActionTextboxHandler<any> = () => true;
      const fn2: t.ActionTextboxHandler<any> = () => false;
      actions.items((e) => {
        e.textbox('  foo  ', fn1);
        e.textbox('bar', fn1);
        e.textbox((config) =>
          config
            .label('  my label  ')
            .placeholder('  my placeholder  ')
            .pipe(fn2)
            .description('  a thing  '),
        );
      });

      const items = model.state.items;
      expect(items.length).to.eql(3);

      const item1 = items[0] as t.ActionTextbox;
      const item2 = items[1] as t.ActionTextbox;
      const item3 = items[2] as t.ActionTextbox;

      expect(item1.kind).to.eql('dev/textbox');
      expect(item1.label).to.eql('foo');
      expect(item1.current).to.eql(undefined);
      expect(item1.placeholder).to.eql(undefined);
      expect(item1.description).to.eql(undefined);
      expect(item1.handlers).to.eql([fn1]);

      expect(item2.kind).to.eql('dev/textbox');
      expect(item2.label).to.eql('bar');
      expect(item2.placeholder).to.eql(undefined);
      expect(item2.description).to.eql(undefined);
      expect(item2.handlers).to.eql([fn1]);

      expect(item3.kind).to.eql('dev/textbox');
      expect(item3.label).to.eql('my label');
      expect(item3.placeholder).to.eql('my placeholder');
      expect(item3.description).to.eql('a thing');
      expect(item3.handlers).to.eql([fn2]);
    });

    it('initial', () => {
      const { actions, model } = create();

      actions.items((e) => {
        e.textbox((config) => config.initial('  hello  '));
      });

      const items = model.state.items;
      expect(items.length).to.eql(1);

      const item = items[0] as t.ActionTextbox;
      expect(item.current).to.eql('hello');
    });

    it('label (no handler)', () => {
      const { actions, model } = create();
      actions.items((e) => e.textbox('foo'));

      const items = model.state.items;
      expect(items.length).to.eql(1);

      const item = items[0] as t.ActionTextbox;
      expect(item.label).to.eql('foo');
      expect(item.placeholder).to.eql(undefined);
      expect(item.handlers).to.eql([]);
    });

    it('pipe multiple handlers', () => {
      const { actions, model } = create();

      const fn1: t.ActionTextboxHandler<any> = () => true;
      const fn2: t.ActionTextboxHandler<any> = () => false;

      actions.items((e) => e.textbox((config) => config.pipe(fn1, fn2, fn1)));

      const items = model.state.items;
      expect(items.length).to.eql(1);
      const item = items[0] as t.ActionTextbox;

      expect(item.handlers.length).to.eql(3);
      expect(item.handlers[0]).to.eql(fn1);
      expect(item.handlers[1]).to.eql(fn2);
      expect(item.handlers[2]).to.eql(fn1);
    });
  });
});
