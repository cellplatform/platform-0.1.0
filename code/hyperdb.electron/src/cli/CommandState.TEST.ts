import { expect } from 'chai';
import { CommandState, ICommandChangeEvent, ICommandState } from '.';
import { Command } from './libs';
import { Subject } from 'rxjs';

const root = Command.create('foo');

describe('CommandState', () => {
  it('creates with default values', () => {
    const state = CommandState.create({ root });
    expect(state.isDisposed).to.eql(false);
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

  it('fires change event', () => {
    const events: Array<ICommandChangeEvent<any>> = [];
    const changes: Array<ICommandState<any>> = [];

    const state = CommandState.create({ root });

    state.events$.subscribe(e => events.push(e));
    state.change$.subscribe(e => changes.push(e));

    state.onChange({ text: 'foo', invoked: false });

    expect(events.length).to.eql(1);
    expect(changes.length).to.eql(1);

    expect(events[0].payload).to.eql(state);
    expect(changes[0]).to.eql(state);
  });
});
