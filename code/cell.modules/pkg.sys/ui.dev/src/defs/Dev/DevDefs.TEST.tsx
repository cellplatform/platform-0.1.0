import React from 'react';
import { ActionsFactory } from '../..';
import { DevDefs, DisplayDefs } from '../../defs';
import { expect, rx, t, SelectUtil } from '../../test';

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
  describe('component', () => {
    it('config', () => {
      const { actions, model } = create();
      expect(model.state.items).to.eql([]);

      const fn: t.ActionComponentHandler<Ctx> = (e) => <div>{e.ctx.count}</div>;
      actions.items((e) => e.component(fn));

      const items = model.state.items;
      expect(items.length).to.eql(1);

      const item = items[0] as t.ActionComponent;
      expect(item.handler).to.eql(fn);
    });
  });

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
      expect(button1.title).to.eql(undefined);
      expect(button1.handlers).to.eql([fn1]);
      expect(button1.indent).to.eql(undefined);

      expect(button2.kind).to.eql('dev/button');
      expect(button2.label).to.eql('bar');
      expect(button2.title).to.eql(undefined);
      expect(button2.handlers).to.eql([fn1]);

      expect(button3.kind).to.eql('dev/button');
      expect(button3.label).to.eql('foo');
      expect(button3.title).to.eql(undefined);
      expect(button3.handlers).to.eql([fn2]);
    });

    it('label (no handler)', () => {
      const { actions, model } = create();

      actions.items((e) => e.button('foo'));

      const items = model.state.items;
      expect(items.length).to.eql(1);

      const button = items[0] as t.ActionButton;
      expect(button.label).to.eql('foo');
      expect(button.title).to.eql(undefined);
      expect(button.handlers).to.eql([]);
    });

    it('config', () => {
      const { actions, model } = create();
      expect(model.state.items).to.eql([]);

      const fn: t.ActionButtonHandler<any> = () => null;
      actions.items((e) =>
        e.button((config) => config.title('  my title ').label('  foo  ').indent(20).pipe(fn)),
      );

      const items = model.state.items;
      expect(items.length).to.eql(1);
      expect(items[0].kind).to.eql('dev/button');

      const button = items[0] as t.ActionButton;
      expect(button.kind).to.eql('dev/button');
      expect(button.label).to.eql('foo');
      expect(button.title).to.eql('my title');
      expect(button.handlers).to.eql([fn]);
      expect(button.indent).to.eql(20);
    });

    it('react components', () => {
      const { actions, model } = create();
      expect(model.state.items).to.eql([]);

      const el = <div>Foo</div>;
      actions.items((e) => e.button((config) => config.title(el).label(el).description(el)));

      const items = model.state.items;
      const button = items[0] as t.ActionButton;

      expect(button.title).to.equal(el);
      expect(button.label).to.equal(el);
      expect(button.description).to.equal(el);
    });

    it('config: "Unnamed"', () => {
      const { actions, model } = create();
      expect(model.state.items).to.eql([]);

      actions.items((e) => e.button((config) => null));

      const items = model.state.items;
      const button = items[0] as t.ActionButton;
      expect(button.kind).to.eql('dev/button');
      expect(button.label).to.eql('Unnamed');
      expect(button.title).to.eql(undefined);
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
        e.boolean((config) =>
          config.title(' my title ').label(' foo ').pipe(fn2).description('a thing').indent(20),
        );
      });

      const items = model.state.items;
      expect(items.length).to.eql(3);

      const bool1 = items[0] as t.ActionBoolean;
      const bool2 = items[1] as t.ActionBoolean;
      const bool3 = items[2] as t.ActionBoolean;

      expect(bool1.kind).to.eql('dev/boolean');
      expect(bool1.title).to.eql(undefined);
      expect(bool1.label).to.eql('foo');
      expect(bool1.description).to.eql(undefined);
      expect(bool1.handlers).to.eql([fn1]);
      expect(bool1.indent).to.eql(undefined);

      expect(bool2.kind).to.eql('dev/boolean');
      expect(bool2.title).to.eql(undefined);
      expect(bool2.label).to.eql('bar');
      expect(bool2.description).to.eql(undefined);
      expect(bool2.handlers).to.eql([fn1]);

      expect(bool3.kind).to.eql('dev/boolean');
      expect(bool3.title).to.eql('my title');
      expect(bool3.label).to.eql('foo');
      expect(bool3.description).to.eql('a thing');
      expect(bool3.handlers).to.eql([fn2]);
      expect(bool3.indent).to.eql(20);
    });

    it('label (no handler)', () => {
      const { actions, model } = create();
      actions.items((e) => e.boolean('foo'));

      const items = model.state.items;
      expect(items.length).to.eql(1);

      const bool = items[0] as t.ActionBoolean;
      expect(bool.label).to.eql('foo');
      expect(bool.handlers).to.eql([]);
    });

    it('react components', () => {
      const { actions, model } = create();
      expect(model.state.items).to.eql([]);

      const el = <div>Foo</div>;
      actions.items((e) => e.boolean((config) => config.title(el).label(el).description(el)));

      const items = model.state.items;
      const bool = items[0] as t.ActionBoolean;

      expect(bool.title).to.equal(el);
      expect(bool.label).to.equal(el);
      expect(bool.description).to.equal(el);
    });

    it('pipe multiple handlers', () => {
      const { actions, model } = create();

      const fn1: t.ActionBooleanHandler<any> = () => true;
      const fn2: t.ActionBooleanHandler<any> = () => false;

      actions.items((e) => e.boolean((config) => config.pipe(fn1, fn2, fn1)));

      const items = model.state.items;
      expect(items.length).to.eql(1);
      const bool = items[0] as t.ActionBoolean;

      expect(bool.handlers.length).to.eql(3);
      expect(bool.handlers[0]).to.eql(fn1);
      expect(bool.handlers[1]).to.eql(fn2);
      expect(bool.handlers[2]).to.eql(fn1);
    });
  });

  describe('select', () => {
    it('config', () => {
      const { actions, model } = create();
      expect(model.state.items).to.eql([]);

      const fn1: t.ActionSelectHandler<any> = () => true;
      const fn2: t.ActionSelectHandler<any> = () => false;
      actions.items((e) => {
        e.select((config) => config.label('  foo  ').pipe(fn1));
        e.select((config) =>
          config
            .title(' my title ')
            .label(' bar ')
            .items(['one', { label: 'two', value: 2 }])
            .initial(2)
            .multi(true)
            .clearable(true)
            .description('a thing')
            .indent(20)
            .pipe(fn2),
        );
      });

      const items = model.state.items;
      expect(items.length).to.eql(2);

      const select1 = items[0] as t.ActionSelect;
      const select2 = items[1] as t.ActionSelect;

      expect(select1.kind).to.eql('dev/select');
      expect(select1.title).to.eql(undefined);
      expect(select1.label).to.eql('foo');
      expect(select1.description).to.eql(undefined);
      expect(select1.items).to.eql([]);
      expect(select1.handlers).to.eql([fn1]);
      expect(select1.multi).to.eql(false);
      expect(select1.clearable).to.eql(undefined);
      expect(select1.indent).to.eql(undefined);

      expect(select2.kind).to.eql('dev/select');
      expect(select2.title).to.eql('my title');
      expect(select2.label).to.eql('bar');
      expect(select2.description).to.eql('a thing');
      expect(select2.items).to.eql(['one', { label: 'two', value: 2 }]);
      expect(select2.handlers).to.eql([fn2]);
      expect(select2.multi).to.eql(true);
      expect(select2.clearable).to.eql(true);
      expect(select2.indent).to.eql(20);
    });

    it('label (no handler)', () => {
      const { actions, model } = create();

      actions.items((e) => e.select((config) => config.label('foo')));

      const items = model.state.items;
      expect(items.length).to.eql(1);

      const select = items[0] as t.ActionSelect;
      expect(select.label).to.eql('foo');
      expect(select.handlers).to.eql([]);
    });

    it('view', () => {
      const { actions, model } = create();

      actions.items((e) => {
        e.select((config) => config.label('one'));
        e.select((config) => config.label('two').view('buttons'));
      });

      const items = model.state.items;
      expect(items.length).to.eql(2);

      const select1 = items[0] as t.ActionSelect;
      const select2 = items[1] as t.ActionSelect;

      expect(select1.view).to.eql('dropdown');
      expect(select2.view).to.eql('buttons');
    });

    it('react components', () => {
      const { actions, model } = create();
      expect(model.state.items).to.eql([]);

      const el = <div>Foo</div>;
      actions.items((e) => e.select((config) => config.title(el).label(el).description(el)));

      const items = model.state.items;
      const select = items[0] as t.ActionSelect;

      expect(select.title).to.equal(el);
      expect(select.label).to.equal(el);
      expect(select.description).to.equal(el);
    });

    it('initial (value)', () => {
      const { actions, model } = create();
      const sample = [
        { label: 'one', value: 1 },
        { label: 'two', value: 2 },
      ];

      actions.items((e) => {
        e.select((config) => config.items([1, 2, 3]));
        e.select((config) => config.items([1, 2, 3]).initial(2));
        e.select((config) => config.items(sample).initial(sample[1]));
      });

      const items = model.state.items;
      const select1 = items[0] as t.ActionSelect;
      const select2 = items[1] as t.ActionSelect;
      const select3 = items[2] as t.ActionSelect;

      expect(select1.items).to.eql([1, 2, 3]);
      expect(select1.current).to.eql([]);
      expect(select1.initial).to.eql(undefined);

      expect(select2.items).to.eql([1, 2, 3]);
      expect(select2.current).to.eql([]);
      expect(select2.initial).to.eql(2);

      expect(select3.items).to.eql(sample);
      expect(select3.current).to.eql([]);
      expect(select3.initial).to.eql(sample[1]);
    });

    it('toInitial (util)', () => {
      const { actions, model } = create();
      const sample = [
        { label: 'one', value: 1 },
        { label: 'two', value: 2 },
        { label: 'three', value: 3 },
      ];

      actions.items((e) => {
        e.select((config) => config.items(sample).initial());
        e.select((config) => config.items(sample).initial(2));
        e.select((config) => config.items(sample).initial(sample[1]));
        e.select((config) => config.items(sample).initial([1, 3]));
        e.select((config) => config.items([1, 2, 3]).initial([1, 3]));
      });

      const items = model.state.items;
      const select1 = items[0] as t.ActionSelect;
      const select2 = items[1] as t.ActionSelect;
      const select3 = items[2] as t.ActionSelect;
      const select4 = items[3] as t.ActionSelect;
      const select5 = items[4] as t.ActionSelect;

      const toInitial = SelectUtil.toInitial;

      expect(toInitial(select1)).to.eql([]);
      expect(toInitial(select2)).to.eql([sample[1]]);
      expect(toInitial(select3)).to.eql([sample[1]]);
      expect(toInitial(select4)).to.eql([sample[0], sample[2]]);
      expect(toInitial(select5)).to.eql([
        { label: '1', value: 1 },
        { label: '3', value: 3 },
      ]);
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
    it('title, handler', () => {
      const { actions, model } = create();
      expect(model.state.items).to.eql([]);

      const fn1: t.ActionTextboxHandler<any> = () => true;
      const fn2: t.ActionTextboxHandler<any> = () => false;
      actions.items((e) => {
        e.textbox('  foo  ', fn1);
        e.textbox('bar', fn1);
        e.textbox((config) =>
          config
            .title('  my title  ')
            .placeholder('  my placeholder  ')
            .pipe(fn2)
            .description('  a thing  ')
            .indent(20),
        );
      });

      const items = model.state.items;
      expect(items.length).to.eql(3);

      const item1 = items[0] as t.ActionTextbox;
      const item2 = items[1] as t.ActionTextbox;
      const item3 = items[2] as t.ActionTextbox;

      expect(item1.kind).to.eql('dev/textbox');
      expect(item1.title).to.eql('foo');
      expect(item1.current).to.eql(undefined);
      expect(item1.placeholder).to.eql(undefined);
      expect(item1.description).to.eql(undefined);
      expect(item1.indent).to.eql(undefined);
      expect(item1.handlers).to.eql([fn1]);

      expect(item2.kind).to.eql('dev/textbox');
      expect(item2.title).to.eql('bar');
      expect(item2.placeholder).to.eql(undefined);
      expect(item2.description).to.eql(undefined);
      expect(item2.handlers).to.eql([fn1]);

      expect(item3.kind).to.eql('dev/textbox');
      expect(item3.title).to.eql('my title');
      expect(item3.placeholder).to.eql('my placeholder');
      expect(item3.description).to.eql('a thing');
      expect(item3.indent).to.eql(20);
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

    it('title (no handler)', () => {
      const { actions, model } = create();
      actions.items((e) => e.textbox('foo'));

      const items = model.state.items;
      expect(items.length).to.eql(1);

      const item = items[0] as t.ActionTextbox;
      expect(item.title).to.eql('foo');
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
