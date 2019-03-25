import { expect } from 'chai';

import { CommandState } from '.';
import { Command } from '../Command';
import { time } from '../common';
import * as t from '../types';

const copy = Command.create('copy')
  .add('fast')
  .add('slow');

const db = Command.create('db')
  .add('ls')
  .add('status')
  .add(copy);

const root = Command.create('root')
  .add('ls')
  .add('mkdir')
  .add(db);

let getInvokeArgsList: t.ICommandStateProps[] = [];
const getInvokeArgs: t.InvokeCommandArgsFactory = async state => {
  getInvokeArgsList = [...getInvokeArgsList, state];
  return { props: { foo: 123 } };
};

describe('CommandState', () => {
  beforeEach(() => (getInvokeArgsList = []));

  it('creates with default values', () => {
    const state = CommandState.create({ root, getInvokeArgs });
    expect(state.isDisposed).to.eql(false);
    expect(state.text).to.eql('');
    expect(state.namespace).to.eql(undefined);
  });

  it('disposes', () => {
    let count = 0;
    const state = CommandState.create({ root, getInvokeArgs });
    state.dispose$.subscribe(() => count++);

    expect(state.isDisposed).to.eql(false);
    state.dispose();
    expect(state.isDisposed).to.eql(true);
    expect(count).to.eql(1);
  });

  describe('toObject', () => {
    it('toObject', () => {
      const state = CommandState.create({ root, getInvokeArgs });
      const obj = state.toObject();
      expect(obj.text).to.eql('');
      expect(obj.command).to.eql(undefined);
      expect(obj.namespace).to.eql(undefined);
    });
  });

  describe('change (events)', () => {
    it('fires [change$] event (observable)', () => {
      const events: t.CommandStateEvent[] = [];
      const changes: Array<t.ICommandStateChangedEvent['payload']> = [];
      const state = CommandState.create({ root, getInvokeArgs });

      state.events$.subscribe(e => events.push(e));
      state.changed$.subscribe(e => changes.push(e));

      state.change({ text: 'foo' });

      expect(events.length).to.eql(1);
      expect(changes.length).to.eql(1);

      const props = { props: state.toObject(), invoked: false, namespace: undefined };
      expect(events[0].payload).to.eql(props);
      expect(changes[0]).to.eql(props);
    });

    it('updates current text on change event', () => {
      const state = CommandState.create({ root, getInvokeArgs });
      expect(state.text).to.eql('');
      state.change({ text: 'hello' });
      expect(state.text).to.eql('hello');
    });

    it('fires [invoke$] event (observable)', () => {
      const events: t.CommandStateEvent[] = [];
      const invokes: Array<t.ICommandStateChangedEvent['payload']> = [];
      const state = CommandState.create({ root, getInvokeArgs });

      state.events$.subscribe(e => events.push(e));
      state.invoke$.subscribe(e => invokes.push(e));

      state.change({ text: 'foo' }); // NB: invoked [false].
      expect(events.length).to.eql(1);
      expect(invokes.length).to.eql(0);

      state.change({ text: 'bar' }); // NB: invoked: true, but no matching command.
      expect(events.length).to.eql(2);
      expect(invokes.length).to.eql(0);

      state.change({ text: 'ls', invoked: true });
      expect(events.length).to.eql(3);
      expect(invokes.length).to.eql(1);
      expect(invokes[0].props.text).to.eql('ls');
      expect(invokes[0].invoked).to.eql(true);

      state.change({ text: 'ls', invoked: true }); // NB: Invoke again.
      expect(events.length).to.eql(4);
      expect(invokes.length).to.eql(2);
    });
  });

  describe('change: namespace', () => {
    it('does not change to namespace if [namespace] flag not set', () => {
      const state = CommandState.create({ root, getInvokeArgs });
      const test = (text: string) => {
        state.change({ text });
        expect(state.namespace).to.eql(undefined);
      };
      test('');
      test('db.copy');
      test('db.copy.fast');
      test('db copy');
      test('db copy fast');
    });

    it('cannot change to a namsespace if no command matches', () => {
      const state = CommandState.create({ root, getInvokeArgs });
      state.change({ text: 'NO_EXIST', namespace: true });
      expect(state.namespace).to.eql(undefined);
    });

    it('does not change to namespace if the command is a root leaf-node', () => {
      const state = CommandState.create({ root, getInvokeArgs });
      state.change({ text: 'ls', namespace: true });
      expect(state.namespace).to.eql(undefined);
    });

    it('changes to a namespace', () => {
      const state = CommandState.create({ root, getInvokeArgs });
      expect(state.namespace).to.eql(undefined);

      state.change({ text: 'db' });
      expect(state.text).to.eql('db');
      expect(state.namespace).to.eql(undefined);

      state.change({ text: 'db', namespace: true });

      const ns = state.namespace;
      expect(ns && ns.command.name).to.eql('db');

      const path = (ns && ns.path.map(m => m.name)) || [];
      expect(path.join('.')).to.eql('db');
      expect(state.text).to.eql(''); // NB: Text is reset when changing to namespace.
    });

    it('changes to deep namespace (db copy)', () => {
      const state = CommandState.create({ root, getInvokeArgs });

      state.change({ text: 'db copy', namespace: true });
      const ns = state.namespace;

      expect(state.command && state.command.name).to.eql(undefined);
      expect(ns && ns.command.name).to.eql('copy');

      const path = (ns && ns.path.map(m => m.name)) || [];
      expect(path).to.eql(['db', 'copy']);
      expect(state.text).to.eql(''); // NB: Text is reset when changing to namespace.
    });

    it('changes to deep namespace - parent of leaf (db copy fast)', () => {
      const state = CommandState.create({ root, getInvokeArgs });

      state.change({ text: 'db copy fast', namespace: true });
      const ns = state.namespace;

      expect(state.command && state.command.name).to.eql('fast');
      expect(ns && ns.command.name).to.eql('copy');

      const path = (ns && ns.path.map(m => m.name)) || [];
      expect(path).to.eql(['db', 'copy']); // Lowest level namespace.
      expect(state.text).to.eql('fast'); // NB: Text is reset when changing to namespace.
    });

    it('changes to deep namespace and retains args', () => {
      const state = CommandState.create({ root, getInvokeArgs });

      state.change({ text: 'db copy fast foo --force', namespace: true });
      const ns = state.namespace;

      expect(state.command && state.command.name).to.eql('fast');
      expect(ns && ns.command.name).to.eql('copy');

      const path = (ns && ns.path.map(m => m.name)) || [];
      expect(path).to.eql(['db', 'copy']); // Lowest level namespace.
      expect(state.text).to.eql('fast foo --force');
      expect(state.args).to.eql({ params: ['foo'], options: { force: true } });
    });

    it('removes namespace', () => {
      const state = CommandState.create({ root, getInvokeArgs }).change({
        text: 'db',
        namespace: true,
      });
      const ns = state.namespace;
      expect(ns && ns.command.name).to.eql('db');

      state.change({ text: 'db', namespace: false });
      expect(state.namespace).to.eql(undefined);
    });
  });

  describe('current [command] property', () => {
    it('match', () => {
      const state = CommandState.create({ root, getInvokeArgs });
      expect(state.command).to.eql(undefined);

      state.change({ text: 'ls' });
      const cmd = state.command;
      expect(cmd && cmd.name).to.eql('ls');
      expect(state.args.params).to.eql([]);
    });

    it('match: removes command value from arg params', () => {
      const root = Command.create('root').add('create');
      const state = CommandState.create({ root, getInvokeArgs });
      state.change({ text: 'create foo bar' });
      expect(state.command && state.command.name).to.eql('create');
      expect(state.args.params).to.eql(['foo', 'bar']); // NB: `create` excluded.
    });

    it('no match', () => {
      const state = CommandState.create({ root, getInvokeArgs });
      expect(state.command).to.eql(undefined);
      state.change({ text: 'YO_MAMA' });
      expect(state.command).to.eql(undefined);
    });

    it('no match (no commands)', () => {
      const root = Command.create('empty');
      const state = CommandState.create({ root, getInvokeArgs });
      expect(state.command).to.eql(undefined);
      state.change({ text: 'ls' });
      expect(state.command).to.eql(undefined);
    });

    it('match from path ("db copy fast")', () => {
      const test = (text: string, expectName: string) => {
        const state = CommandState.create({ root, getInvokeArgs });
        expect(state.command).to.eql(undefined);
        state.change({ text });
        expect(state.text).to.eql(text);
        expect(state.command && state.command.name).to.eql(expectName);
      };
      test('db copy fast', 'fast');
      test('db copy fast foo', 'fast');
      test('db copy fast foo bar baz', 'fast');
    });
  });

  describe('invoke', () => {
    it('does not invoke when no command', async () => {
      const root = Command.create('root').add('run');
      const state = CommandState.create({ root, getInvokeArgs });
      const res = await state.invoke();
      expect(res.invoked).to.eql(false);
      expect(res.state.command).to.eql(undefined);
      expect(res.props.foo).to.eql(123); // Derived from `getInvokeArgs` factory.
    });

    it('invokes the current command (with props from factory)', async () => {
      const list: t.ICommandHandlerArgs[] = [];
      const root = Command.create('root').add('run', async args => {
        await time.wait(10);
        list.push(args);
        return 1234;
      });
      const state = CommandState.create({ root, getInvokeArgs });
      state.change({ text: 'run foo --force' });

      const res = await state.invoke();

      expect(res.invoked).to.eql(true);
      expect(res.state.command && res.state.command.name).to.eql('run');

      expect(list.length).to.eql(1);
      expect(list[0].args).to.eql({ params: ['foo'], options: { force: true } });

      const response = res.response;
      expect(response && response.result).to.eql(1234);
    });

    it('invokes with props/args from parameter', async () => {
      const list: t.ICommandHandlerArgs[] = [];
      const root = Command.create('root').add('run', async args => {
        list.push(args);
      });
      const state = CommandState.create({ root, getInvokeArgs });
      state.change({ text: 'run' });

      await state.invoke({ props: { msg: 'hello' }, timeout: 1234, args: '--force' });

      expect(list.length).to.eql(1);
      const item = list[0];
      expect(item.args).to.eql({ params: [], options: { force: true } });
      expect(item.props).to.eql({ msg: 'hello' });
    });

    it('fires `invoking` | `invoked` events', async () => {
      const events: t.CommandStateEvent[] = [];
      const root = Command.create('root').add('run');
      const state = CommandState.create({ root, getInvokeArgs });
      state.change({ text: 'run' });

      state.events$.subscribe(e => events.push(e));
      const res = await state.invoke({ stepIntoNamespace: false });

      expect(events.length).to.eql(2);
      expect(res.cancelled).to.eql(false);

      expect(events[0].type).to.eql('COMMAND/state/invoking');
      expect(events[1].type).to.eql('COMMAND/state/invoked');
      expect(events[1].payload).to.eql(res);
    });

    it('cancels invoke operation from BEFORE event', async () => {
      const events: t.CommandStateEvent[] = [];
      let count = 0;
      const root = Command.create('root').add('run', e => count++);
      const state = CommandState.create({ root, getInvokeArgs });
      state.change({ text: 'run' });

      state.events$.subscribe(e => events.push(e));
      state.invoking$.subscribe(e => e.cancel());
      const res = await state.invoke();

      expect(count).to.eql(0);
      expect(res.cancelled).to.eql(true);

      expect(events[2].type).to.eql('COMMAND/state/invoked');
      const e = events[2].payload as t.ICommandStateInvokedEvent['payload'];
      expect(e.cancelled).to.eql(true);
      expect(e.invoked).to.eql(false);
    });

    it('no namespace change', async () => {
      const root = Command.create('root').add('run');
      const state = CommandState.create({ root, getInvokeArgs });

      state.change({ text: 'run' });
      expect(state.namespace).to.eql(undefined);

      const res = await state.invoke({ stepIntoNamespace: true }); // NB: default:true
      expect(state.namespace).to.eql(undefined);
      expect(res.changedNamespace).to.eql(false);
    });

    it('steps into a namespace upon invoking (directly)', async () => {
      const ns = Command.create('ns')
        .add('list')
        .add('run');
      const root = Command.create('root').add(ns);
      const state = CommandState.create({ root, getInvokeArgs });
      expect(state.namespace).to.eql(undefined);

      state.change({ text: 'ns' });
      expect(state.namespace).to.eql(undefined);

      const res = await state.invoke({ stepIntoNamespace: true }); // NB: default:true

      expect(state.namespace && state.namespace.command.name).to.eql('ns');
      expect(res.changedNamespace).to.eql(true);
    });

    it('steps into a namespace upon invoking (indirectly)', async () => {
      const ns = Command.create('ns')
        .add('list')
        .add('run');
      const root = Command.create('root').add(ns);
      const state = CommandState.create({ root, getInvokeArgs });
      expect(state.namespace).to.eql(undefined);

      state.change({ text: 'ns run foo --force' });
      expect(state.namespace).to.eql(undefined);

      const res = await state.invoke();

      expect(res.changedNamespace).to.eql(true);
      expect(state.namespace && state.namespace.command.name).to.eql('ns');

      const args = { params: ['foo'], options: { force: true } };
      expect(res.args).to.eql(args);
      expect(state.args).to.eql(args);
      expect(state.text).to.eql('run foo --force');
    });

    it('invokes command directy within namespace', async () => {
      const ns = Command.create('ns')
        .add('list')
        .add('run');
      const root = Command.create('root').add(ns);
      const state = CommandState.create({ root, getInvokeArgs });
      expect(state.namespace).to.eql(undefined);

      state.change({ text: 'ns', namespace: true });
      expect(state.namespace && state.namespace.name).to.eql('ns');

      const args = { params: ['foo'], options: { force: true } };
      state.change({ text: 'run foo --force' });
      expect(state.text).to.eql('run foo --force');
      expect(state.args).to.eql(args);

      const res = await state.invoke();

      expect(res.changedNamespace).to.eql(true);
      expect(state.namespace && state.namespace.command.name).to.eql('ns');

      expect(res.args).to.eql(args);
      expect(state.args).to.eql(args);
      expect(state.text).to.eql('run foo --force');
    });
  });
});
