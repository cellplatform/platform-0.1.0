import * as React from 'react';

import { expect } from 'chai';
import { Loader } from './Loader';
import { t, time } from '../common';

const Foo = (props: {}) => <div />;

describe('Loader', () => {
  it('adds a module configurtion', () => {
    const loader = Loader.create();
    expect(loader.length).to.eql(0);

    const events: t.IModuleAddedEvent[] = [];
    loader.events$.subscribe(e => events.push(e as any));

    loader
      .add('foo', async () => <Foo />)
      .add('bar', async () => <Foo />)
      .add('baz', async () => <Foo />);

    expect(loader.length).to.eql(3);

    expect(events.length).to.eql(3);
    expect(events[0].payload.module.id).to.eql('foo');
    expect(events[1].payload.module.id).to.eql('bar');
    expect(events[2].payload.module.id).to.eql('baz');
  });

  it('adds with timeout (default and custom)', () => {
    const loader = Loader.create()
      .add('foo', async () => 'FOO')
      .add('bar', async () => 'BAR', { timeout: 1500 });
    const res1 = loader.get('foo');
    const res2 = loader.get('bar');
    expect(res1 && res1.timeout).to.eql(Loader.DEFAULT.TIMEOUT);
    expect(res2 && res2.timeout).to.eql(1500);
  });

  it('get (by id)', () => {
    const loader = Loader.create().add('foo', async () => <Foo />);
    const res1 = loader.get('foo');
    const res2 = loader.get('bar');
    expect(res1 && res1.id).to.eql('foo');
    expect(res2).to.eql(undefined);
  });

  it('get (by index)', async () => {
    const loader = Loader.create()
      .add('foo', async () => <Foo />)
      .add('bar', async () => <Foo />);
    const res1 = loader.get(0);
    const res2 = loader.get(1);
    const res3 = loader.get(2);
    expect(res1 && res1.id).to.eql('foo');
    expect(res2 && res2.id).to.eql('bar');
    expect(res3).to.eql(undefined);
  });

  it('exists', () => {
    const loader = Loader.create().add('foo', async () => <Foo />);
    expect(loader.exists('foo')).to.eql(true);
    expect(loader.exists('bar')).to.eql(false);
  });

  it('throws if a module with the same ID is added more than once', () => {
    const fn = () => {
      Loader.create()
        .add('foo', async () => <Foo />)
        .add('foo', async () => <Foo />);
    };
    expect(fn).to.throw(/A module with the id 'foo' has already been added/);
  });

  describe('load', () => {
    it('module does not exist', async () => {
      const loader = Loader.create();
      const res = await loader.load('NO_EXIST');
      expect(res.ok).to.eql(false);
      expect(res.error && res.error.message).to.include('does not exist');
      expect(res.count).to.eql(-1);
      expect(res.timedOut).to.eql(false);
    });

    it('loads and invokes', async () => {
      type MyObject = { count: number };
      type MyProps = { msg: string };

      const response: MyObject = { count: 123 };
      let props: any;
      const loader = Loader.create().add('foo', async p => {
        props = p;
        return response;
      });

      const res = await loader.load<MyObject, MyProps>('foo', { msg: 'hello' });

      expect(res.count).to.eql(1);
      expect(res.result).to.eql(response);
      expect(res.result && res.result.count).to.eql(123);
      expect(props).to.eql({ msg: 'hello' });
    });

    it('multiple times (count)', async () => {
      const loader = Loader.create().add('foo', async () => ({ text: 'mama' }));
      expect(loader.isLoaded('foo')).to.eql(false);
      expect(loader.count('foo')).to.eql(0);
      expect(loader.count('NO_EXIST')).to.eql(-1);

      const res1 = await loader.load('foo');
      expect(loader.isLoaded('foo')).to.eql(true);
      expect(loader.count('foo')).to.eql(1);

      const res2 = await loader.load('foo');
      expect(res1).to.not.equal(res2);
      expect(loader.count('foo')).to.eql(2);
    });

    it('isLoaded', async () => {
      const loader = Loader.create();
      expect(loader.isLoaded('foo')).to.eql(false);

      loader.add('foo', async () => 123);
      expect(loader.isLoaded('foo')).to.eql(false);

      const res1 = loader.get('foo');
      expect(res1 && res1.isLoaded).to.eql(false);

      await loader.load('foo');
      const res2 = loader.get('foo');
      expect(res2 && res2.isLoaded).to.eql(true);
      expect(loader.isLoaded('foo')).to.eql(true);
    });

    it('loading/loaded event', async () => {
      const el = <Foo />;
      const loader = Loader.create().add('foo', async () => el);
      const item = loader.get('foo');

      const events: t.LoaderEvent[] = [];
      loader.events$.subscribe(e => events.push(e as any));

      await loader.load('foo'); // Invoked via loader's method.
      if (item) {
        await item.load(); // NB: Same as above, but via the dynamic-module item itself.
      }

      expect(events.length).to.eql(4);

      expect(events[0].type).to.eql('LOADER/loading');
      expect(events[1].type).to.eql('LOADER/loaded');

      expect(events[2].type).to.eql('LOADER/loading');
      expect(events[3].type).to.eql('LOADER/loaded');

      const e0 = events[0] as t.IModuleLoadingEvent;
      const e1 = events[1] as t.IModuleLoadedEvent;

      expect(e0.payload.count).to.eql(1);
      expect(e0.payload.module).to.eql('foo');

      expect(e1.payload.count).to.eql(1);
      expect(e1.payload.module).to.eql('foo');
      expect(e1.payload.result).to.eql(el);
      expect(e1.payload.error).to.eql(undefined);

      expect(e1.payload.id).to.eql(e0.payload.id);
    });

    it('error on load', async () => {
      const err = new Error('My error');
      const loader = Loader.create().add('foo', async () => {
        throw err;
      });
      const res = await loader.load('foo');

      expect(res.ok).to.eql(false);
      expect(res.count).to.eql(1);
      expect(res.error).to.equal(err);
      expect(res.timedOut).to.eql(false);
    });

    it('error on timeout', async () => {
      const loader = Loader.create().add('foo', async () => time.wait(50), { timeout: 10 });
      const res = await loader.load('foo');

      expect(res.ok).to.eql(false);
      expect(res.count).to.eql(1);
      expect(res.error && res.error.message).to.include('timed out');
      expect(res.timedOut).to.eql(true);
    });
  });

  describe('render', () => {
    type MyProps = { msg: string };

    it('renders JSX element', async () => {
      const el = <Foo />;
      let props: any;
      const loader = Loader.create().add('foo', async p => {
        props = p;
        return el;
      });

      const res = await loader.render<MyProps>('foo', { msg: 'hello' });

      expect(res.count).to.eql(1);
      expect(res.element).to.eql(el);
      expect(props).to.eql({ msg: 'hello' });
    });

    it('renders nothing (no return element) as null', async () => {
      const loader = Loader.create().add('foo', async () => undefined);
      const res = await loader.render<MyProps>('foo', { msg: 'hello' });

      expect(res.element).to.eql(null);
      expect(res.ok).to.eql(false);
      expect(res.error && res.error.message).to.include('did not render a JSX element');
    });

    it('throws if the result is not a JSX.Element', async () => {
      const loader = Loader.create().add('foo', async () => ({}));
      const res = await loader.render<MyProps>('foo', { msg: 'hello' });

      expect(res.element).to.eql({});
      expect(res.ok).to.eql(false);
      expect(res.error && res.error.message).to.include(
        'returned a result that was not JSX element',
      );
    });
  });
});
