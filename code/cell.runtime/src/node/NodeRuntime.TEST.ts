import { expect } from '../test';
import { NodeRuntime } from '.';

describe('NodeRuntime', () => {
  it('init', () => {
    const runtime = NodeRuntime.init();
    expect(runtime.name).to.eql('node');
  });
});
