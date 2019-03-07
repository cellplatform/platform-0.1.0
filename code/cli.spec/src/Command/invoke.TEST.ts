import { expect } from 'chai';

import { Command } from '.';
import { time } from '../common';
import * as t from './types';

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

  it('invokes with no handler', async () => {
    const root = Command.create<P, A>('root').add('copy');
    const copy = root.childrenAs<P, A>()[0];
    const res = await copy.invoke<R>({ props: { text: 'Hello' } });
    expect(res.isComplete).to.eql(true);
    expect(res.result).to.eql(undefined);
  });

  it('fires [before/set/after] event sequence', async () => {
    const events: t.CommandInvokeEvent[] = [];
    const root = Command.create<P, A>('root').add('copy', e => {
      e.set('text', 'one'); // NB: not async, no return value.
    });

    const res = root.childrenAs<P, A>()[0].invoke({ props: { text: 'Hello' } });
    res.events$.subscribe(e => events.push(e));

    expect(events.length).to.eql(1);
    expect(events[0].type).to.eql('COMMAND/invoke/before');

    await res;

    expect(events.length).to.eql(3);
    expect(events[0].type).to.eql('COMMAND/invoke/before');
    expect(events[1].type).to.eql('COMMAND/invoke/set');
    expect(events[2].type).to.eql('COMMAND/invoke/after');

    const id = events[0].payload.invokeId;
    expect(events[0].payload.invokeId).to.eql(id);
    expect(events[1].payload.invokeId).to.eql(id);
    expect(events[2].payload.invokeId).to.eql(id);
  });

  it('fires set events through observable hierarchy', async () => {
    const rootCommandEvents: t.CommandEvent[] = [];
    const copyCommandEvents: t.CommandEvent[] = [];
    const invokeEvents: t.CommandInvokeEvent[] = [];

    const root = Command.create<P, A>('root').add('copy', async e => {
      return time.delay(0, () => {
        e.set('text', 'one');
        e.set('text', 'two');
        e.set('text', 'three');
      });
    });

    const copy = root.childrenAs<P, A>()[0];

    root.events$.subscribe(e => rootCommandEvents.push(e));
    copy.events$.subscribe(e => copyCommandEvents.push(e));

    const res = copy.invoke({ props: { text: 'Hello' } });
    expect(res.props).to.eql({ text: 'Hello' });
    res.events$.subscribe(e => invokeEvents.push(e));

    await res;

    const setEvents = invokeEvents
      .filter(e => e.type === 'COMMAND/invoke/set')
      .map(e => (e as t.ICommandInvokeSetEvent<P>).payload);

    expect(invokeEvents.length).to.greaterThan(setEvents.length);

    expect(setEvents[0].value).to.eql('one');
    expect(setEvents[1].value).to.eql('two');
    expect(setEvents[2].value).to.eql('three');

    expect(setEvents[0].props.text).to.eql('one');
    expect(setEvents[1].props.text).to.eql('two');
    expect(setEvents[2].props.text).to.eql('three');

    expect(copyCommandEvents).to.eql(invokeEvents);
    expect(rootCommandEvents).to.eql(invokeEvents);
  });

  it('error', async () => {
    const commandEvents: t.CommandEvent[] = [];
    const invokeEvents: t.CommandInvokeEvent[] = [];

    const root = Command.create<P, A>('root').add('copy', async e => {
      throw new Error('MyError');
    });

    const copy = root.childrenAs<P, A>()[0];
    copy.events$.subscribe(e => commandEvents.push(e));

    const res = copy.invoke<R>({ props: { text: 'Hello' } });
    res.events$.subscribe(e => invokeEvents.push(e));
    expect(res.error).to.eql(undefined);

    const count = {
      complete: 0,
      error: 0,
    };
    res.events$.subscribe({
      complete: () => count.complete++,
      error: err => count.error++,
    });

    let error: Error | undefined;
    try {
      await res;
    } catch (err) {
      error = err;
    }
    expect(error && error.message).to.eql('MyError');

    // Error on AFTER observable event.
    expect(commandEvents).to.eql(invokeEvents);
    const lastEvent = invokeEvents[invokeEvents.length - 1] as t.ICommandInvokeAfterEvent;
    expect(lastEvent.payload.error && lastEvent.payload.error.message).to.eql('MyError');

    // Error on response object.
    expect(res.error && res.error.message).to.eql('MyError');

    // Subscription.
    expect(count.complete).to.eql(1);
    expect(count.error).to.eql(0); // NB: Completes as expected passing the Error. The observable is not in an error state.
  });

  it('timeout', async () => {
    const commandEvents: t.CommandEvent[] = [];
    const invokeEvents: t.CommandInvokeEvent[] = [];

    const root = Command.create<P, A>('root').add('copy', async e => {
      await time.delay(30);
    });

    const copy = root.childrenAs<P, A>()[0];
    copy.events$.subscribe(e => commandEvents.push(e));

    const res = copy.invoke<R>({ props: { text: 'Hello' }, timeout: 10 });
    res.events$.subscribe(e => invokeEvents.push(e));
    expect(res.isTimedOut).to.eql(false);
    expect(res.error).to.eql(undefined);

    let error: Error | undefined;
    try {
      await res;
    } catch (err) {
      error = err;
    }
    expect(res.isTimedOut).to.eql(true);

    expect(error && error.message).to.include('timed out');
    expect(res.error && res.error.message).to.include('timed out');

    // Timeout error on AFTER event.
    expect(commandEvents).to.eql(invokeEvents);
    const afterEvent = invokeEvents[invokeEvents.length - 1] as t.ICommandInvokeAfterEvent;
    expect(afterEvent.payload.error && afterEvent.payload.error.message).to.include('timed out');
  });
});
