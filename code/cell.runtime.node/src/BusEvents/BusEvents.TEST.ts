import { expect, rx, t } from '../test';
import { BusEvents } from '.';

const bus = rx.bus();

describe.only('BusEvents', () => {
  const is = BusEvents.is;

  it('init', () => {
    const runtime = 'abc';
    const events = BusEvents({ bus, runtime });
    expect(events.runtime).to.eql(runtime);
  });

  it('is.base', () => {
    const test = (type: string, expected: boolean) => {
      expect(is.base({ type, payload: {} })).to.eql(expected);
    };
    test('foo', false);
    test('cell.runtime.node/', true);
  });

  it('is.lifecycle.ended', () => {
    const test = (stage: t.RuntimeRunStage, expected: boolean) => {
      expect(is.lifecycle(stage).ended).to.eql(expected);
    };

    test('killed', true);
    test('completed:ok', true);
    test('completed:error', true);

    test('started', false);

    test(null as any, false);
    test(undefined as any, false);
    test('foo' as any, false);
    test(123 as any, false);
    test({} as any, false);
  });

  it('is.lifecycle.ok', () => {
    const test = (stage: t.RuntimeRunStage, expected: boolean) => {
      expect(is.lifecycle(stage).ok).to.eql(expected);
    };

    test('killed', false);
    test('completed:error', false);

    test('completed:ok', true);
    test('started', true);

    test(null as any, false);
    test(undefined as any, false);
    test('foo' as any, false);
    test(123 as any, false);
    test({} as any, false);
  });
});
