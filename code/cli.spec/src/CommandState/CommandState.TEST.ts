import { expect } from 'chai';

import { CommandState } from '.';
import { Command } from '../Command';
import * as t from './types';

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
      const events: t.CommandStateEvent[] = [];
      const changes: Array<t.ICommandStateChangeEvent['payload']> = [];
      const state = CommandState.create({ root });

      state.events$.subscribe(e => events.push(e));
      state.change$.subscribe(e => changes.push(e));

      state.change({ text: 'foo' });

      expect(events.length).to.eql(1);
      expect(changes.length).to.eql(1);

      const props = { ...state.toObject(), invoked: false };
      expect(events[0].payload).to.eql(props);
      expect(changes[0]).to.eql(props);
    });

    it('updates current text on change event', () => {
      const state = CommandState.create({ root });
      expect(state.text).to.eql('');
      state.change({ text: 'hello' });
      expect(state.text).to.eql('hello');
    });
  });

  describe('invoke', () => {
    it('fires [invoke$] event (observable)', () => {
      const events: t.CommandStateEvent[] = [];
      const invokes: Array<t.ICommandStateChangeEvent['payload']> = [];
      const state = CommandState.create({ root });

      state.events$.subscribe(e => events.push(e));
      state.invoke$.subscribe(e => invokes.push(e));

      state.change({ text: 'foo' }); // NB: invoked: false
      expect(events.length).to.eql(1);
      expect(invokes.length).to.eql(0);

      state.change({ text: 'bar' }); // NB: invoked: true, but no matching command.
      expect(events.length).to.eql(2);
      expect(invokes.length).to.eql(0);

      state.change({ text: 'ls', invoked: true });
      expect(events.length).to.eql(3);
      expect(invokes.length).to.eql(1);
      expect(invokes[0].text).to.eql('ls');
      expect(invokes[0].invoked).to.eql(true);

      state.change({ text: 'ls', invoked: true }); // NB: Invoke again.
      expect(events.length).to.eql(4);
      expect(invokes.length).to.eql(2);
    });
  });

  describe('current [command] property', () => {
    it('match', () => {
      const state = CommandState.create({ root });
      expect(state.command).to.eql(undefined);
      state.change({ text: 'ls' });
      const cmd = state.command;
      expect(cmd && cmd.name).to.eql('ls');
      expect(state.args.params).to.eql([]);
    });

    it('match: removes command value from arg params', () => {
      const root = Command.create('root').add('create');
      const state = CommandState.create({ root });
      state.change({ text: 'create foo bar' });
      expect(state.command && state.command.name).to.eql('create');
      expect(state.args.params).to.eql(['foo', 'bar']); // NB: `create` excluded.
    });

    it('no match', () => {
      const state = CommandState.create({ root });
      expect(state.command).to.eql(undefined);
      state.change({ text: 'YO_MAMA' });
      expect(state.command).to.eql(undefined);
    });

    it('no match (no commands)', () => {
      const root = Command.create('empty');
      const state = CommandState.create({ root });
      expect(state.command).to.eql(undefined);
      state.change({ text: 'ls' });
      expect(state.command).to.eql(undefined);
    });
  });
});
