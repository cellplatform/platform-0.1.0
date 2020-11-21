import { expect } from '../test';
import { NodeRuntime } from '.';

/**
 * NOTE:
 *    For all server/data related tests that exercise pulling
 *    bundles from a server see:
 *
 *        [@platform/cell.http.router]/src/tests/test.route/func.TEST.ts
 *
 *    Which spins up a mock server to test against.
 *
 */

describe('NodeRuntime', () => {
  it('init', () => {
    const runtime = NodeRuntime.init();
    expect(runtime.name).to.eql('node');
  });
});
