import { expect } from 'chai';
import { CommandState } from '.';

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
});
