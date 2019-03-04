import { expect } from 'chai';
import { CommandEvent, CommandState, ICommandStateProps } from '.';
import { Command } from '../Command';

const root = Command.create('fs')
  .add('ls')
  .add('mkdir');

describe('CommandState', () => {
  it('creates with default values', () => {
    const state = CommandState.create({ root });
    expect(state.isDisposed).to.eql(false);
    expect(state.text).to.eql('');
  });

  it('disposes', () => {
    let count = 0;
    const state = CommandState.create({ root });
    state.dispose$.subscribe(() => count++);

    expect(state.isDisposed).to.eql(false);
    state.dispose();
    expect(state.isDisposed).to.eql(true);
    expect(count).to.eql(1);
  });

  describe('toObject', () => {
    it('toObject', () => {
      const state = CommandState.create({ root });
      const obj = state.toObject();
      expect(obj.text).to.eql('');
      expect(obj.command).to.eql(undefined);
    });
  });

  describe('change', () => {
    it('fires [change$] event (observable)', () => {
      const events: CommandEvent[] = [];
      const changes: ICommandStateProps[] = [];
      const state = CommandState.create({ root });

      state.events$.subscribe(e => events.push(e));
      state.change$.subscribe(e => changes.push(e));

      state.onChange({ text: 'foo' });

      expect(events.length).to.eql(1);
      expect(changes.length).to.eql(1);

      expect(events[0].payload).to.eql(state.toObject());
      expect(changes[0]).to.eql(state.toObject());
    });

    it('updates current text on change event', () => {
      const state = CommandState.create({ root });
      expect(state.text).to.eql('');
      state.onChange({ text: 'hello' });
      expect(state.text).to.eql('hello');
    });
  });

  describe('invoke', () => {
    it('fires [invoke$] event (observable)', () => {
      const events: CommandEvent[] = [];
      const invokes: ICommandStateProps[] = [];
      const state = CommandState.create({ root });

      state.events$.subscribe(e => events.push(e));
      state.invoke$.subscribe(e => invokes.push(e));

      state.onChange({ text: 'foo' }); // NB: invoked: false

      expect(events.length).to.eql(1);
      expect(invokes.length).to.eql(0);

      state.onChange({ text: 'bar', invoked: true });
      expect(events.length).to.eql(3); // NB: 3 === 1 (prior) + <change> + <invoke>.
      expect(invokes.length).to.eql(1);
      expect(invokes[0].text).to.eql('bar');
    });
  });

  describe('filtering on current [command]', () => {
    it('match', () => {
      const state = CommandState.create({ root });
      expect(state.command).to.eql(undefined);
      state.onChange({ text: 'ls' });
      const cmd = state.command;
      expect(cmd && cmd.title).to.eql('ls');
    });

    it('no match', () => {
      const state = CommandState.create({ root });
      expect(state.command).to.eql(undefined);
      state.onChange({ text: 'YO_MAMA' });
      expect(state.command).to.eql(undefined);
    });

    it('no match (no commands)', () => {
      const root = Command.create('empty');
      const state = CommandState.create({ root });
      expect(state.command).to.eql(undefined);
      state.onChange({ text: 'ls' });
      expect(state.command).to.eql(undefined);
    });
  });

  describe('argument parsing', () => {
    it('simple string command args', () => {
      const res = CommandState.parse('  foo  bar  ');
      expect(res.commands).to.eql(['foo', 'bar']);
      expect(res.params).to.eql({});
    });

    it('typed command values', () => {
      const res = CommandState.parse(' .123  true  false    text  ');
      expect(res.commands[0]).to.eql(0.123);
      expect(res.commands[1]).to.eql(true);
      expect(res.commands[2]).to.eql(false);
      expect(res.commands[3]).to.eql('text');
    });

    it('params only', () => {
      type Foo = { f: boolean; n: boolean; a: boolean };
      const res = CommandState.parse<Foo>('-fna');
      expect(res.commands).to.eql([]);
      expect(res.params).to.eql({ f: true, n: true, a: true });
      expect(res.params.f).to.eql(true);
      expect(res.params.n).to.eql(true);
      expect(res.params.a).to.eql(true);
    });

    it('param types', () => {
      const res = CommandState.parse(
        '--count 123 --text=hello --no=false --yes=true --json={foo:123}',
      );
      expect(res.params.count).to.eql(123);
      expect(res.params.text).to.eql('hello');
      expect(res.params.no).to.eql(false);
      expect(res.params.yes).to.eql(true);
      expect(res.params.json).to.eql('{foo:123}');
    });
  });
});
