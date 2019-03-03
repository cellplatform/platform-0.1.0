import { expect } from 'chai';
import { CommandState, ICommandChangeEvent, ICommandState } from '.';

describe('CommandState', () => {
  it('creates with default values', () => {
    const cmd = CommandState.create();
    expect(cmd.isDisposed).to.eql(false);
  });

  it('disposes', () => {
    const cmd = CommandState.create();
    expect(cmd.isDisposed).to.eql(false);
    cmd.dispose();
    expect(cmd.isDisposed).to.eql(true);
  });

  it('fires change event', () => {
    const events: ICommandChangeEvent[] = [];
    const changes: ICommandState[] = [];
    const cmd = CommandState.create();

    cmd.events$.subscribe(e => events.push(e));
    cmd.change$.subscribe(e => changes.push(e));

    cmd.onChange({ text: 'foo', invoked: false });

    expect(events.length).to.eql(1);
    expect(changes.length).to.eql(1);

    expect(events[0].payload).to.eql(cmd);
    expect(changes[0]).to.eql(cmd);
  });
});
