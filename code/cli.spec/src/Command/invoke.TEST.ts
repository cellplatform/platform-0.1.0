import { expect } from 'chai';

import { Command } from '.';
import { time } from '../common';
import * as t from './types';

/**
 * TODO
 * - timeout
 * - invoke events from root command (bubble up)
 * - error(?)
 * - get / set
 *    - mutate props (different object)
 *    - fire set event.
 */

describe('Command.invoke', () => {
  type P = { text: string };
  type A = { force?: boolean; f?: boolean };
  type R = { foo: number };

  it('invokes with response (async)', async () => {
    let e: t.ICommandHandlerArgs<P, A> | undefined;

    const root = Command.create<P, A>('root')
      .add('foo')
      .add('copy', async args => {
        e = args;
        return { foo: 123 };
      });

    const copy = root.childrenAs<P, A>()[1];

    const props = { text: 'Hello' };
    const res = copy.invoke<R>({ props, args: '-f' });

    expect(res.isComplete).to.eql(false);
    expect(res.args).to.eql({ params: [], options: { f: true } });
    expect(res.props).to.eql(props);
    expect(res.result).to.eql(undefined);

    await res;

    expect(e && e.args).to.eql(res.args);
    expect(e && e.props).to.eql(res.props);
    expect(e && e.get('text')).to.eql('Hello');

    expect(res.isComplete).to.eql(true);
    expect(res.result).to.eql({ foo: 123 });
  });

  it('invokes with response (sync)', async () => {
    const root = Command.create<P, A>('root').add('copy', e => ({ foo: 123 }));
    const copy = root.childrenAs<P, A>()[0];
    const res = await copy.invoke<R>({ props: { text: 'Hello' } });
    expect(res.isComplete).to.eql(true);
    expect(res.result).to.eql({ foo: 123 });
  });

  it('fires start/set/complete event sequence', async () => {
    const events: t.CommandInvokeEvent[] = [];
    const root = Command.create<P, A>('root').add('copy', e => {
      e.set('text', 'one'); // NB: not async, no return value.
    });
    const res = root.childrenAs<P, A>()[0].invoke({ props: { text: 'Hello' } });

    res.events$.subscribe(e => events.push(e));

    expect(events.length).to.eql(1);
    expect(events[0].type).to.eql('COMMAND/invoke/start');

    await res;

    expect(events.length).to.eql(3);
    expect(events[0].type).to.eql('COMMAND/invoke/start');
    expect(events[1].type).to.eql('COMMAND/invoke/set');
    expect(events[2].type).to.eql('COMMAND/invoke/complete');

    const id = events[0].payload.invokeId;
    expect(events[0].payload.invokeId).to.eql(id);
    expect(events[1].payload.invokeId).to.eql(id);
    expect(events[2].payload.invokeId).to.eql(id);
  });

  it('fires set events through observable', async () => {
    const events: t.CommandInvokeEvent[] = [];

    const root = Command.create<P, A>('root').add('copy', async e => {
      return time.delay(0, () => {
        e.set('text', 'one');
        e.set('text', 'two');
        e.set('text', 'three');
      });
    });
    const res = root.childrenAs<P, A>()[0].invoke({ props: { text: 'Hello' } });

    expect(res.props).to.eql({ text: 'Hello' });
    res.events$.subscribe(e => events.push(e));

    await res;

    const setEvents = events
      .filter(e => e.type === 'COMMAND/invoke/set')
      .map(e => (e as t.ICommandInvokeSetEvent<P>).payload);

    expect(events.length).to.greaterThan(setEvents.length);

    expect(setEvents[0].value).to.eql('one');
    expect(setEvents[1].value).to.eql('two');
    expect(setEvents[2].value).to.eql('three');

    expect(setEvents[0].props.text).to.eql('one');
    expect(setEvents[1].props.text).to.eql('two');
    expect(setEvents[2].props.text).to.eql('three');
  });
});
