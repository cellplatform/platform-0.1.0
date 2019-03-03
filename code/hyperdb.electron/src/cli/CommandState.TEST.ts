import { expect } from 'chai';
import { CommandState, ICommandChangeEvent, ICommandState } from '.';
import { Command } from './libs';

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

  describe('change', () => {
    it('fires change event', () => {
      const events: Array<ICommandChangeEvent<any>> = [];
      const changes: Array<ICommandState<any>> = [];

      const state = CommandState.create({ root });

      state.events$.subscribe(e => events.push(e));
      state.change$.subscribe(e => changes.push(e));

      state.onChange({ text: 'foo', invoked: true });

      expect(events.length).to.eql(1);
      expect(changes.length).to.eql(1);

      expect(events[0].payload).to.eql(state);
      expect(changes[0]).to.eql(state);
    });

    it('updates current text', () => {
      const state = CommandState.create({ root });
      expect(state.text).to.eql('');
      state.onChange({ text: 'hello' });
      expect(state.text).to.eql('hello');
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
});
